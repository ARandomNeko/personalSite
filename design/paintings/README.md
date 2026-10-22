# Journal paintings

Authentic historical paintings, downloaded from the linked public-domain collection records. No generated imagery.

- `turner-moonlight.jpg`: J. M. W. Turner, *Keelmen Heaving in Coals by Moonlight*, 1835. [National Gallery of Art](https://www.nga.gov/artworks/1225-keelmen-heaving-coals-moonlight). Image from its IIIF endpoint, 1600px.
- `bocklin-island.jpg`: Arnold Böcklin, *Island of the Dead*, 1880. [Metropolitan Museum of Art](https://www.metmuseum.org/art/collection/search/435683). Open Access image DP-14201-003.
- `martin-wrath.jpg`: John Martin, *The Great Day of His Wrath*, 1851–53. [Wikimedia Commons / Tate / Google Art Project](https://commons.wikimedia.org/wiki/File:John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg). 1280px reproduction.
- The Monet sunset original is shared from `/moodboard/assets/monet-etretat-sunset.jpg`; see the moodboard asset credits.
- `jupiter-and-semele.jpg` was used during the preceding art study; it is not loaded by the current demo.

The `*-dither.webp` files are fixed four-tone Bayer treatments, prepared by `scripts/prepare-journal-art.mjs`. They are composited at the margins over the original reproductions. This processing happens during asset preparation, never in the live scroll handler.

## Picker catalogue

`catalogue.json` is the credit and responsive-image manifest shared with
`src/lib/art/catalogue.json`. The picker now includes a **Knights & legends**
collection: Leighton, Dicksee, Waterhouse, Vasnetsov, Arbo, Kittelsen, Schinkel,
Hughes, Friedrich, Burne-Jones, Martin, and Duncan. Each record links to its
source record and full original and preserves source dimensions independently
of the locally delivered image size. Dates marked undated are not inferred.

New reproductions come from Wikimedia Commons collection records. The Arbo
Wild Hunt and Kittelsen Palace/Troll museum photographs retain CC BY 4.0
attribution in the preview; other records carry their public-domain source
status. These are resized reproductions, without generative processing or
upscaling. Style and subject labels are editorial.

`node scripts/prepare-painting-catalogue.mjs SOURCE_JSON MASTER_DIRECTORY --append`
adds responsive WebP assets while retaining existing artwork IDs and catalogue
entries. The optional append mode rejects collisions. Normal browsing loads
lazy 480px thumbnails; previews and journal backgrounds select larger variants
with `srcset`. Native originals are only requested explicitly in the detail view
or through the original-image link. Some local masters use Commons' supported
3840px or 1920px previews when original downloads are rate limited.
The additions' download manifest is `scripts/art-sources/knights.json`.

The collection lives at `/paintings?subject=knights`. Expanding the catalogue does not replace browser selections.

The approved 25-painting sequence is tracked in `src/lib/art/selection.json`,
imported from the owner’s latest export in its original order. Browser preview
preferences now use revision 2 so earlier trials do not override the approved
site default. New picker selections still save and apply within this revision.
