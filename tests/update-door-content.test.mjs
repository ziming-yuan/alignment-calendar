import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const { zonedTimeToUtc } = require("date-fns-tz");
const source = await readFile(new URL("../src/app/_actions.js", import.meta.url), "utf8");
const form = {
    doorId: "test-door",
    name: "Prayer day",
    date: "2026-12-01T09:00:00",
    autoOpenTime: "2026-12-08T09:00:00",
    message: "Test message",
    youtubeVideoUrl: "https://www.youtube.com/watch?v=example1234",
    closedDoorText: "December 1",
    closedDoorColor: "#ffffff",
    closedDoorTextColor: "#000000",
    contentImgKey: "old-content",
    closedImgKey: "old-closed",
};

async function harness({ results = [], databaseError, missingDoor = false, cleanupError } = {}) {
    const events = [];
    const record = {
        contentImage: { fileUrl: "https://utfs.io/f/old-content", fileKey: "old-content" },
        closedDoorImage: { fileUrl: "https://utfs.io/f/old-closed", fileKey: "old-closed" },
    };
    let update;
    const context = vm.createContext({ console: { error() {} } });
    const imports = {
        "@/utils/uploadthingServer": { utapi: {
            async uploadFiles(file) {
                events.push(["upload", file]);
                const result = results.shift();
                if (result instanceof Error) throw result;
                return result;
            },
            async deleteFiles(keys) {
                events.push(["delete", keys]);
                if (cleanupError) throw cleanupError;
            },
        } },
        "next/cache": { revalidateTag(tag) { events.push(["revalidate", tag]); } },
        "next/server": { NextResponse: {} },
        "@/lib/dbConnect": { default: async () => {} },
        "@/models/door": { default: {
            async findByIdAndUpdate(id, value) {
                events.push(["save", id]);
                if (databaseError) throw databaseError;
                if (missingDoor) return null;
                update = value.$set;
                for (const [key, value] of Object.entries(update)) {
                    const [field, child] = key.split(".");
                    if (child) record[field][child] = value;
                    else record[field] = value;
                }
                return record;
            },
        } },
        "@/models/calendar": { default: {} },
        "@/models/user": { default: {} },
        bcryptjs: { default: {} },
        "date-fns-tz": { zonedTimeToUtc },
    };
    const module = new vm.SourceTextModule(source, { context });
    await module.link((name) => {
        const exports = imports[name];
        assert.ok(exports, `Unexpected dependency: ${name}`);
        return new vm.SyntheticModule(Object.keys(exports), function () {
            for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
        }, { context });
    });
    await module.evaluate();
    return {
        events, record,
        update: () => update,
        save: (changes, files = {}) => module.namespace.updateDoorContent(
            { ...form, ...changes }, { get: name => files[name] ?? null }
        ),
    };
}

test("replacement saves the uploaded closed image independently of YouTube and content image", async () => {
    const image = { name: "closed-door.jpg" };
    const h = await harness({ results: [{ data: { url: "https://utfs.io/f/new-closed", key: "new-closed" }, error: null }] });
    await h.save({ closedDoorImageFileUpdated: true, closedDoorImageOgFileDeleted: true }, { closedDoorImage: image });
    assert.equal(h.record.closedDoorImage.fileUrl, "https://utfs.io/f/new-closed");
    assert.equal(h.record.closedDoorImage.fileKey, "new-closed");
    assert.equal(h.record.contentImage.fileUrl, "https://utfs.io/f/old-content");
    assert.equal(h.record.youtubeVideoUrl, form.youtubeVideoUrl);
    assert.deepEqual(h.events.map(e => e[0]), ["upload", "save", "revalidate", "delete"]);
    assert.equal(h.events[0][1], image);
    assert.deepEqual(Array.from(h.events.at(-1)[1]), ["old-closed"]);
});

test("upload failure preserves the old closed image and does not save or delete anything", async () => {
    const h = await harness({ results: [{ data: null, error: { message: "Upload denied" } }] });
    await assert.rejects(h.save({ closedDoorImageFileUpdated: true, closedDoorImageOgFileDeleted: true }), /Could not upload the closed-door image/);
    assert.equal(h.record.closedDoorImage.fileKey, "old-closed");
    assert.deepEqual(h.events.map(e => e[0]), ["upload"]);
});

test("a thrown upload error also preserves the previous image", async () => {
    const h = await harness({ results: [new Error("Network unavailable")] });
    await assert.rejects(h.save({ closedDoorImageFileUpdated: true, closedDoorImageOgFileDeleted: true }), /Network unavailable/);
    assert.equal(h.record.closedDoorImage.fileKey, "old-closed");
    assert.deepEqual(h.events.map(e => e[0]), ["upload"]);
});

test("saving only the YouTube URL leaves both image fields unchanged", async () => {
    const h = await harness();
    await h.save({ youtubeVideoUrl: "https://youtu.be/newvideo123" });
    assert.equal(h.record.closedDoorImage.fileKey, "old-closed");
    assert.equal(h.record.contentImage.fileKey, "old-content");
    assert.equal(h.record.youtubeVideoUrl, "https://youtu.be/newvideo123");
    assert.equal(h.update()["closedDoorImage.fileUrl"], undefined);
    assert.deepEqual(h.events.map(e => e[0]), ["save", "revalidate"]);
});

test("content and closed-door uploads retain separate URLs", async () => {
    const h = await harness({ results: [
        { data: { url: "https://utfs.io/f/new-content", key: "new-content" } },
        { data: { url: "https://utfs.io/f/new-closed", key: "new-closed" } },
    ] });
    await h.save({ contentImageFileUpdated: true, closedDoorImageFileUpdated: true });
    assert.equal(h.record.contentImage.fileUrl, "https://utfs.io/f/new-content");
    assert.equal(h.record.closedDoorImage.fileUrl, "https://utfs.io/f/new-closed");
});

test("a failed database save does not delete the old image", async () => {
    const h = await harness({ databaseError: new Error("Database unavailable"), results: [{ data: { url: "https://utfs.io/f/new-closed", key: "new-closed" } }] });
    await assert.rejects(h.save({ closedDoorImageFileUpdated: true, closedDoorImageOgFileDeleted: true }), /Database unavailable/);
    assert.equal(h.record.closedDoorImage.fileKey, "old-closed");
    assert.deepEqual(h.events.map(e => e[0]), ["upload", "save"]);
});

test("a missing door does not delete any previous file", async () => {
    const h = await harness({ missingDoor: true });
    await assert.rejects(h.save({ closedDoorImageOgFileDeleted: true }), /door could not be found/);
    assert.deepEqual(h.events.map(e => e[0]), ["save"]);
});

test("explicit removal clears only the closed image before deleting its file", async () => {
    const h = await harness();
    await h.save({ closedDoorImageOgFileDeleted: true });
    assert.equal(h.record.closedDoorImage.fileUrl, "");
    assert.equal(h.record.contentImage.fileKey, "old-content");
    assert.deepEqual(h.events.map(e => e[0]), ["save", "revalidate", "delete"]);
});

test("cleanup failure leaves a successfully saved replacement intact", async () => {
    const h = await harness({ cleanupError: new Error("Cleanup unavailable"), results: [{ data: { url: "https://utfs.io/f/new-closed", key: "new-closed" } }] });
    await h.save({ closedDoorImageFileUpdated: true, closedDoorImageOgFileDeleted: true });
    assert.equal(h.record.closedDoorImage.fileKey, "new-closed");
});
