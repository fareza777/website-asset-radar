"use client";

import { useRef, useState } from "react";
import {
  Stack as StackIcon,
  X as XIcon,
  Plus as PlusIcon,
  Check as CheckIcon,
} from "@phosphor-icons/react";
import { useLibrary } from "./library-provider";

export function CollectionPicker({ assetId }: { assetId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const { collections, createCollection, toggleInCollection, notify } =
    useLibrary();
  return (
    <>
      <button
        className="button secondary"
        onClick={() => dialog.current?.showModal()}
      >
        <StackIcon size={19} /> Add to collection
      </button>
      <dialog
        ref={dialog}
        className="library-dialog"
        aria-labelledby="collection-dialog-title"
      >
        <div className="dialog-heading">
          <h2 id="collection-dialog-title">Keep your ideas together.</h2>
          <button
            className="icon-button"
            aria-label="Close collections"
            onClick={() => dialog.current?.close()}
          >
            <XIcon size={20} />
          </button>
        </div>
        <p>Save this asset to a personal collection in your browser.</p>
        <div className="collection-choices">
          {collections.map((collection) => (
            <button
              key={collection.id}
              className="collection-choice"
              aria-pressed={collection.assetIds.includes(assetId)}
              onClick={() => toggleInCollection(collection.id, assetId)}
            >
              <StackIcon size={20} />
              <span>{collection.name}</span>
              <span
                className={`choice-check ${collection.assetIds.includes(assetId) ? "checked" : ""}`}
              >
                {collection.assetIds.includes(assetId) && (
                  <CheckIcon size={13} />
                )}
              </span>
            </button>
          ))}
          {collections.length === 0 && (
            <p className="dialog-empty">
              Your first collection starts with a name.
            </p>
          )}
        </div>
        <form
          className="new-collection-form"
          onSubmit={(event) => {
            event.preventDefault();
            const id = createCollection(name);
            if (id) {
              toggleInCollection(id, assetId);
              setName("");
              notify("Collection created and asset added");
            }
          }}
        >
          <label htmlFor="collection-name">New collection</label>
          <div>
            <input
              id="collection-name"
              name="name"
              placeholder="e.g. My cozy RPG"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={60}
            />
            <button
              className="button primary"
              disabled={!name.trim() || collections.length >= 100}
              type="submit"
            >
              <PlusIcon size={18} /> Create
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
