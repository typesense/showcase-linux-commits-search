export async function onRequest(context) {  
    let request = context.request;
    const url = new URL(request.url)
    console.log("pathname", url.pathname);
    return context.env.PROD.fetch(request);
    // return new Response("Hello, world!")
}