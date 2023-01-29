export function onRequest(context) {  
    // return new Response("Hello, world!")
    let request = context.request;
    console.log(request.url);
    console.log(request.pathname);
    return context.env.ASSETS.fetch(context.request.url);
}
