# frozen_string_literal: true

require 'dotenv/load'
require 'typesense'
require 'oj'
require 'amazing_print'

BATCH_SIZE = (ENV['BATCH_SIZE'] || 1000).to_i
MAX_BATCHES = (ENV['MAX_BATCHES'] || 200_000).to_i
START_LINE = (ENV['START_LINE'] || 1).to_i
JSONL_DATA_FILE = ENV['JSONL_DATA_FILE'] || './data/transformed_dataset.json'

TYPESENSE_HOST = ENV['TYPESENSE_HOST']
TYPESENSE_PORT = ENV['TYPESENSE_PORT']
TYPESENSE_PROTOCOL = ENV['TYPESENSE_PROTOCOL']
TYPESENSE_ADMIN_API_KEY = ENV['TYPESENSE_ADMIN_API_KEY']
TYPESENSE_COLLECTION_ALIAS = ENV['TYPESENSE_COLLECTION_NAME'] || 'commits'
TYPESENSE_EXISTING_COLLECTION_NAME = ENV['TYPESENSE_EXISTING_COLLECTION_NAME']
UPDATE_ALIAS = ENV['UPDATE_COLLECTION_ALIAS'] == 'true'

typesense_client = Typesense::Client.new(
  api_key: TYPESENSE_ADMIN_API_KEY,
  nodes: [
    {
      host: TYPESENSE_HOST,
      port: TYPESENSE_PORT,
      protocol: TYPESENSE_PROTOCOL
    }
  ],
  connection_timeout_seconds: 100,
  retry_interval_seconds: 60,
  num_retries: 5
)

COLLECTION_NAME = TYPESENSE_EXISTING_COLLECTION_NAME || "#{TYPESENSE_COLLECTION_ALIAS}_#{Time.now.utc.to_i}"

if TYPESENSE_EXISTING_COLLECTION_NAME
  puts "Populating existing collection in Typesense #{COLLECTION_NAME}"
else
  schema = {
    'name' => COLLECTION_NAME,
    'fields' => [
      {
        'name' => 'is_merge',
        'type' => 'bool',
        'facet' => true
      },
      {
        'name' => 'author_name',
        'type' => 'string',
        'optional' => true,
        'facet' => true
      },
      {
        'name' => 'author_email_domain',
        'type' => 'string',
        'optional' => true,
        'facet' => true
      },
      {
        'name' => 'author_timestamp_year',
        'type' => 'int64',
        'optional' => true,
        'facet' => true
      },
      {
        'name' => 'committer_name',
        'type' => 'string',
        'optional' => true,
        'facet' => true
      },
      {
        'name' => 'committer_email_domain',
        'type' => 'string',
        'optional' => true,
        'facet' => true
      },
      {
        'name' => 'subject',
        'type' => 'string',
        'optional' => true
      },
      {
        'name' => 'body',
        'type' => 'string',
        'optional' => true
      },
      {
        'name' => 'num_files_changed',
        'type' => 'int32',
        'optional' => true,
        'facet' => true
      },
      {
        'name' => 'num_insertions',
        'type' => 'int32',
        'optional' => true,
        'facet' => true
      },
      {
        'name' => 'num_deletions',
        'type' => 'int32',
        'optional' => true,
        'facet' => true
      }
    ],
    'default_sorting_field' => 'author_timestamp'
  }

  puts "Populating new collection in Typesense #{COLLECTION_NAME}"
  puts 'Creating schema'
  typesense_client.collections.create(schema)
end

puts 'Adding records: '

line_number = 0
File.foreach(JSONL_DATA_FILE).each_slice(BATCH_SIZE) do |lines|
  line_number += BATCH_SIZE

  if line_number < START_LINE
    puts "Skipping lines upto #{line_number} (START_LINE=#{START_LINE})"
    next
  end

  raw_import_results = typesense_client.collections[COLLECTION_NAME].documents.import(lines.join("\n"))

  parsed_import_results = raw_import_results.split("\n").map do |r|
    Oj.load(r)
  rescue Oj::ParseError
    puts "Oj::ParseError for #{r}"
    nil
  end.compact
  failed_items = parsed_import_results.filter { |r| r['success'] == false }
  if failed_items.empty?
    puts "Indexed lines upto #{line_number} ✅"
  else
    ap failed_items
    puts 'Indexing error'
  end

  break if line_number >= MAX_BATCHES * BATCH_SIZE
end

if UPDATE_ALIAS
  old_collection_name = nil

  begin
    old_collection_name = typesense_client.aliases[TYPESENSE_COLLECTION_ALIAS].retrieve['collection_name']
  rescue Typesense::Error::ObjectNotFound
    # Do nothing
  end

  puts "Update alias #{TYPESENSE_COLLECTION_ALIAS} -> #{COLLECTION_NAME}"
  typesense_client.aliases.upsert(TYPESENSE_COLLECTION_ALIAS, { 'collection_name' => COLLECTION_NAME })

  if old_collection_name
    puts "Deleting old collection #{old_collection_name}"
    typesense_client.collections[old_collection_name].delete
  end
end
