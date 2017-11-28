// ----------------------------------------------------------------------------
// Utility function
// ----------------------------------------------------------------------------
export function urlExists(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}