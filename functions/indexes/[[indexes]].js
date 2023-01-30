export function onRequest(context) {  
    let request = context.request;
    const url = new URL(request.url)
    let newUrl = "https://linux-search-log.peiyao212.workers.dev" + url.pathname;
    console.log("newUrl", newUrl);
    return context.env.SERVICE.fetch(newUrl);
}