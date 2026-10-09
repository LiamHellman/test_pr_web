# Liam Hellman — A personal network

A bilingual personal portfolio centered on industrial relations, presented as a crisp 2D network map inspired by Montréal's early métro diagrams. Built with dependency-free HTML, CSS, JavaScript, and SVG.

## Explore

- Six meaningful stops on a geographically coherent Montréal network: introduction, education, experience, industrial relations, projects, and personal interests.
- Six linked city landmarks, including Roger-Gaudry pavilion, Bar Rosemont, the Berri and Guimard entrances, Place des Arts, and the Montréal Biosphere.
- Four line-aware pixel métro trains that follow the tracks, ease between stops, and dwell at stations.
- Two-frame pixel pedestrians who move only between featured stations and their paired landmarks after a train arrives.
- Arrival-triggered pixel light sequences contained inside each station and landmark icon.
- A restrained interface with only résumé, contact, and language controls.
- English/French content and downloadable résumés.
- Keyboard-operable stations, native modal focus management, and automatic reduced-motion support.
- Responsive layout with a Berri–UQAM-centered, horizontally pannable map on small screens.

## Run locally

From the repository folder:

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173`. No install or build step is required.

Run the dependency-free animation-bound check with:

```sh
node tests/pixel-bounds.mjs
```

## Publish on GitHub Pages

In the repository, open **Settings → Pages**, choose **Deploy from a branch**, then choose **main** and **/ (root)**. Save. The default address will be `https://liamhellman.github.io/test_pr_web/` after deployment completes.

All asset references are relative, so the site works at either a repository subpath or a custom domain. To use a custom domain, configure it in Pages settings and set the DNS records required by GitHub; do not add a CNAME file until the domain is configured.

## Edit

- `app.js`: bilingual copy, station and landmark data, and synchronized train and pedestrian behavior.
- `style.css`: layout, colours, responsive styles, and reduced-motion behavior.
- `index.html`: page structure, metadata, and content security policy.
- `assets/`: original supplied English/French résumé PDFs and favicon.

The résumé downloads include the contact information in the supplied originals. Copy presents industrial relations topics as interests, rather than claiming professional HR experience. No academic papers or unverified project links are included.

## Security and privacy

No backend, dependencies, network API calls, contact form, analytics, cookies, or browser storage. Content security policy allows local scripts and styles and blocks connections, embedded objects, and form submissions. The repository and site contain no credentials. A static site still depends on the security of its hosting and repository access; no software can guarantee zero vulnerabilities.

GitHub Pages does not support custom response headers. For a host that does, set a CSP response header (including `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`. The document's CSP meta tag cannot restrict framing.
