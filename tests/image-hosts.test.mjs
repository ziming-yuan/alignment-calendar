import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { images } = require("../next.config.js");
const { hasMatch } = require("next/dist/shared/lib/match-remote-pattern.js");
const { getImgProps } = require("next/dist/shared/lib/get-img-props.js");
const { imageConfigDefault } = require("next/dist/shared/lib/image-config.js");
const allows = url => hasMatch(images.domains, images.remotePatterns, new URL(url));

test("current UploadThing app images and legacy images are both allowed", () => {
    assert.equal(hasMatch(images.domains, [], new URL("https://uj3l1parvf.ufs.sh/f/closed-door.jpg")), false);
    assert.equal(allows("https://uj3l1parvf.ufs.sh/f/closed-door.jpg"), true);
    assert.equal(allows("https://utfs.io/f/old-closed-door.jpg"), true);
    assert.equal(allows("https://i1.ytimg.com/vi/example/mqdefault.jpg"), true);
});

test("new UploadThing permission is restricted to this app's HTTPS file URLs", () => {
    assert.equal(allows("https://different-app.ufs.sh/f/image.jpg"), false);
    assert.equal(allows("http://uj3l1parvf.ufs.sh/f/image.jpg"), false);
    assert.equal(allows("https://uj3l1parvf.ufs.sh/admin"), false);
});

test("closed-door images are served directly without the Vercel optimizer", () => {
    for (const src of [
        "https://utfs.io/f/closed-door.jpg",
        "https://uj3l1parvf.ufs.sh/f/closed-door.jpg",
        "https://i1.ytimg.com/vi/example/mqdefault.jpg",
    ]) {
        const { props } = getImgProps(
            { src, alt: "Closed Door Image", width: 250, height: 125 },
            { imgConf: { ...imageConfigDefault, ...images }, defaultLoader: ({ src }) => "/_next/image?url=" + encodeURIComponent(src) }
        );
        assert.equal(props.src, src);
        assert.equal(props.srcSet, undefined);
    }
});
