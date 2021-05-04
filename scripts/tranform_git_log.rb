# frozen_string_literal: true

require 'dotenv/load'
require 'zlib'
require 'oj'
require 'amazing_print'
require 'date'

MAX_RECORDS = (ENV['MAX_RECORDS'] || 2_000_000).to_i
DATA_FILE = ENV['DATA_FILE'] || './data/git-log-output.gz'
OUTPUT_FILE = ENV['OUTPUT_FILE'] || './data/transformed_dataset.json'
REPO_NAME = ENV['REPO_NAME'] || 'linux'
FIELD_SEPARATOR = '---tsgitlogseparator---'

puts 'Processing gitlog output...'

File.open(OUTPUT_FILE, 'w') do |output_file|
  gzip_reader = Zlib::GzipReader.new(File.open(DATA_FILE))

  line_number = 0
  record_number = 0
  current_record = ''
  gzip_reader.each_line do |line|
    line_number += 1
    # If this line starts with a new record marker and there is a previous accumulated record
    #   Process previous record
    if line.start_with?("#{FIELD_SEPARATOR}#{REPO_NAME}#{FIELD_SEPARATOR}") && current_record != ''
      record_number += 1

      current_record_components = current_record.encode('UTF-8', invalid: :replace).split(FIELD_SEPARATOR)

      num_files_changed = (current_record_components[12].match(/(\d)* files? changed/) || [])[1] || 0
      num_insertions = (current_record_components[12].match(/(\d)* insertions?/) || [])[1] || 0
      num_deletions = (current_record_components[12].match(/(\d)* deletions?/) || [])[1] || 0

      current_record_object = {
        repo: current_record_components[1],
        sha: current_record_components[2],
        author_name: current_record_components[3],
        author_email_domain: current_record_components[4].gsub(/.+@(.*)/, '\1'),
        author_timestamp: current_record_components[5].to_i,
        author_timestamp_year: Time.at(current_record_components[5].to_i).utc.year,
        committer_name: current_record_components[6],
        committer_email_domain: current_record_components[7].gsub(/.+@(.*)/, '\1'),
        committer_timestamp: current_record_components[8].to_i,
        committer_timestamp_year: Time.at(current_record_components[8].to_i).utc.year,
        ref_names: current_record_components[9] == '' ? nil : current_record_components[9],
        subject: current_record_components[10],
        body: current_record_components[11],
        num_files_changed: num_files_changed.to_i,
        num_insertions: num_insertions.to_i,
        num_deletions: num_deletions.to_i
      }

      current_record_object.compact!

      jsonl_string = Oj.dump(current_record_object, mode: :compat)
      output_file.write("#{jsonl_string}\n") unless jsonl_string.empty?

      puts "Processed records upto #{record_number} (#{line_number} lines) ✅"

      # Set current_record to the line we read
      current_record = line
    else
      ## Keep accumulating otherwise
      current_record = "#{current_record}\n#{line}"
    end

    break if record_number >= MAX_RECORDS
  end
end
