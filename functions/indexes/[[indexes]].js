export function onRequest(context) {  
    let request = context.request;
    console.log("url", request.url);
    let newUrl = "https://linux-commit-search-backend.jiangbo.space/indexes" + request.url.split('/indexes')[1];
    console.log("newUrl", newUrl);
    const url = new URL(request.url)
    console.log("pathname", url.pathname);
    const result = context.env.ASSETS.fetch(newUrl);
    console.log("result", result);
    return result;
}
