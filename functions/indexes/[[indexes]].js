export function onRequest(context) {  
    // return new Response("Hello, world!")
    return context.env.ASSETS.fetch(context.request.url)
}
