"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Plus as PlusIcon,
  Stack as StackIcon,
  X as XIcon,
  Trash as TrashIcon,
  ArrowLeft as ArrowLeftIcon,
} from "@/lib/icons";
import { useLibrary } from "./library-provider";
import { AssetGallery } from "./asset-gallery";
import { catalogIndexUrl } from "@/lib/generated/catalog";

export function PersonalCollections() {
  const { collections, createCollection, deleteCollection, notify } =
    useLibrary();
  const [name, setName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const selected = collections.find((c) => c.id === selectedId);
  return (
    <section className="personal-collections">
      <div className="collections-heading">
        <div>
          <h2>Your collections</h2>
          <p>Your own little corner of the library. Saved in this browser.</p>
        </div>
        <button
          className="button secondary"
          onClick={() => dialog.current?.showModal()}
        >
          <PlusIcon size={17} /> New collection
        </button>
      </div>
      {selected ? (
        <>
          <button
            className="text-button personal-back"
            onClick={() => setSelectedId(null)}
          >
            <ArrowLeftIcon size={16} /> All your collections
          </button>
          {selected.assetIds.length === 0 ? (
            <div className="collection-empty">
              <StackIcon size={32} weight="duotone" />
              <div>
                <h3>{selected.name} is ready for its first find.</h3>
                <p>Add assets to this collection from their detail pages.</p>
                <Link className="text-link" href="/">
                  Browse the asset library
                </Link>
              </div>
            </div>
          ) : (
            <AssetGallery
              assets={[]}
              catalogUrl={catalogIndexUrl}
              scope={{ ids: selected.assetIds, includeArchived: true }}
              initialCount={selected.assetIds.length}
              heading={selected.name}
              showCategories={false}
            />
          )}
        </>
      ) : collections.length ? (
        <div className="personal-grid">
          {collections.map((collection) => (
            <div className="personal-card" key={collection.id}>
              <button
                className="personal-open"
                onClick={() => setSelectedId(collection.id)}
              >
                <StackIcon size={29} weight="duotone" />
                <strong>{collection.name}</strong>
                <span>
                  {collection.assetIds.length}{" "}
                  {collection.assetIds.length === 1 ? "asset" : "assets"}
                </span>
              </button>
              <button
                className="icon-button personal-delete"
                aria-label={`Delete collection ${collection.name}`}
                onClick={() => {
                  deleteCollection(collection.id);
                  notify("Collection deleted");
                }}
              >
                <TrashIcon size={17} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="collection-empty">
          <StackIcon size={32} weight="duotone" />
          <div>
            <h3>A home for your next project.</h3>
            <p>Create a collection, then add assets from their detail pages.</p>
          </div>
        </div>
      )}
      <dialog
        className="library-dialog"
        ref={dialog}
        aria-labelledby="new-collection-title"
      >
        <div className="dialog-heading">
          <h2 id="new-collection-title">Start a new collection.</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={() => dialog.current?.close()}
          >
            <XIcon size={20} />
          </button>
        </div>
        <p>Give your next project a place to begin.</p>
        <form
          className="new-collection-form"
          onSubmit={(e) => {
            e.preventDefault();
            const id = createCollection(name);
            if (id) {
              setName("");
              dialog.current?.close();
              notify("Your new collection is ready");
            }
          }}
        >
          <label htmlFor="new-collection-name">Collection name</label>
          <input
            id="new-collection-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            placeholder="e.g. My next platformer"
          />
          <button
            className="button primary"
            type="submit"
            disabled={!name.trim() || collections.length >= 100}
          >
            Create collection <PlusIcon size={17} />
          </button>
        </form>
      </dialog>
    </section>
  );
}
