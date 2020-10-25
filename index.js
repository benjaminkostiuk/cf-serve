
// Define an array of links
const LINKS = [
  { name: "Geo Guessr", url: "https://www.geoguessr.com" },
  { name: "A Soft Murmur", url: "https://asoftmurmur.com" },
  { name: "A Good Movie To Watch", url: "https://agoodmovietowatch.com" }
];
// Define an array of social media platforms
const PLATFORMS = [
  { name: "linkedin", url: "https://www.linkedin.com/in/benjaminkostiuk" },
  { name: "github", url: "https://github.com/benjaminkostiuk" },
  { name: "googlechrome", url: "https://benkostiuk.com" },
  { name: "gmail", url: "mailto:benkostiuk1@gmail.com" },
  { name: "medium", url: "https://medium.com/@benkostiuk" }
];

const LINKS_PATH = "/links";
const STATIC_LINKS_URL = "https://static-links-page.signalnerve.workers.dev";
const PROFILE_IMG_PATH = "https://github.com/benjaminkostiuk.png"
const NAME = "Benjamin Kostiuk";
const BG_COLOUR = "bg-teal-600";

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Respond to request
 * @param {Request} request
 */
async function handleRequest(request) {
  const url = new URL(request.url);   // get the request url

  // For /links path return JSON response with array of links
  if(url.pathname === LINKS_PATH) {
    return new Response(JSON.stringify(LINKS), {
      headers: { 'Content-type': "application/json;charset=UTF-8" }
    });
  }

  // Get SVG elements for social media
  await Promise.all(PLATFORMS.map(platform => {
    return fetch(`https://simpleicons.org/icons/${platform.name}.svg`).then(async res => {
      platform.svg = await res.text();
    });
  }));

  // Get HTML from static links page
  const response = await fetch(STATIC_LINKS_URL, { headers: { 'Content-type': "text/html;charset=UTF-8" }});
  // Transform with HtmlRewriter
  let newHTMLResponse = new HTMLRewriter()
    .on('title', { element: e => e.setInnerContent(NAME) })   // replace title with name
    .on('body', { element: e => e.setAttribute('class', BG_COLOUR)})  // replace background color
    .on('div#links', new LinksTransformer(LINKS))   // add links
    .on('div#profile', { element: e => e.setAttribute('style', '') })   // remove display:none on profile
    .on('div#profile > h1#name', { element: e => e.setInnerContent(NAME) })   // add name to profile
    .on('div#profile > img#avatar', { element: e => e.setAttribute('src', PROFILE_IMG_PATH)})   // add profile img
    .on('div#social', new SocialTransformer(PLATFORMS))   // add social media links
    .transform(response);

  // Set content type
  newHTMLResponse.headers.set('Content-type', "text/html;chartset=UTF-8");
  return newHTMLResponse;
}

class LinksTransformer {
  constructor(links) {
    this.links = links;
  }

  /**
   * Append links inside element
   * @param {*} element Element to be transformed
   */
  async element(element) {
    this.links.forEach(link => {
      element.append(`<a href="${link.url}">${link.name}</a>`, { html: true });
    });
  }
}

class SocialTransformer {
  constructor(platforms) {
    this.platforms = platforms;
  }

  /**
   * Append social media links with svg icons
   * @param {*} element Element to be transformed
   */
  async element(element) {
    element.setAttribute('style', '');
    this.platforms.forEach(async platform => {
      element.append(`<a style="fill:white" href="${platform.url}">${platform.svg}</a>`, {html: true});
    });
  }
}
