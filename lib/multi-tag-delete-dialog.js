"use strict";

const React = require("react");
const { useState, useEffect, useCallback, useMemo } = React;

const DEFAULT_TAG_COLOR = "#b8b8b8";

const MultiTagDeleteDialog = () => {
  const dialogRef = React.useRef(null);
  const [visible, setVisible] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  const openDialog = useCallback(() => {
    const el = dialogRef.current;
    if (el && !el.hasAttribute("open")) {
      el.showModal();
      setVisible(true);
    }
  }, []);

  const closeDialog = useCallback(() => {
    const el = dialogRef.current;
    if (el && el.hasAttribute("open")) {
      el.close();
    }
    setVisible(false);
  }, []);

  // Sync visible state when dialog is closed natively (e.g. ESC key)
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => setVisible(false);
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, []);

  const fetchTags = useCallback(async () => {
    const db = inkdrop.main.dataStore.getLocalDB();
    const allTags = inkdrop.store.getState().tags.all || [];

    // Query actual note counts per tag from the DB
    const tagsWithCounts = await Promise.all(
      allTags.map(async (tag) => {
        try {
          const result = await db.notes.findWithTag(tag._id);
          const count = result && result.docs ? result.docs.length : 0;
          return { ...tag, _noteCount: count };
        } catch {
          return { ...tag, _noteCount: 0 };
        }
      })
    );

    setTags(tagsWithCounts);
    setSelectedIds(new Set());
  }, []);

  useEffect(() => {
    const sub = inkdrop.commands.add(document.body, {
      "multi-tag-delete:toggle": () => {
        if (visible) {
          closeDialog();
        } else {
          fetchTags();
          openDialog();
        }
      },
    });
    return () => sub.dispose();
  }, [visible, fetchTags, openDialog, closeDialog]);

  const toggleTag = useCallback((tagId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(tags.map((t) => t._id)));
  }, [tags]);

  const selectNone = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectUnused = useCallback(() => {
    const unused = tags.filter((t) => t._noteCount === 0).map((t) => t._id);
    setSelectedIds(new Set(unused));
  }, [tags]);

  const affectedNoteCount = useMemo(() => {
    return tags
      .filter((t) => selectedIds.has(t._id))
      .reduce((sum, t) => sum + (t._noteCount || 0), 0);
  }, [tags, selectedIds]);

  const handleDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const msg =
      `Delete ${selectedIds.size} tag(s)? ` +
      `${affectedNoteCount} note(s) will have tags removed.`;

    if (!confirm(msg)) return;

    setDeleting(true);
    try {
      const db = inkdrop.main.dataStore.getLocalDB();
      for (const tagId of selectedIds) {
        await db.utils.deleteTag(tagId);
      }
      fetchTags();
      closeDialog();
    } catch (err) {
      console.error("multi-tag-delete: deletion failed", err);
      inkdrop.notifications.addError("Failed to delete tags", {
        detail: err.message,
        dismissable: true,
      });
    } finally {
      setDeleting(false);
    }
  }, [selectedIds, affectedNoteCount, fetchTags, closeDialog]);

  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) => a.name.localeCompare(b.name));
  }, [tags]);

  return React.createElement(
    "dialog",
    {
      ref: dialogRef,
      className: "multi-tag-delete-dialog",
      style: { width: 500, maxWidth: "90vw" },
    },
    React.createElement("h2", null, "Multi Tag Delete"),
    React.createElement(
      "div",
      { className: "select-actions" },
      React.createElement(
        "button",
        { className: "ui mini button", onClick: selectAll },
        "Select All"
      ),
      React.createElement(
        "button",
        { className: "ui mini button", onClick: selectNone },
        "Select None"
      ),
      React.createElement(
        "button",
        { className: "ui mini teal button", onClick: selectUnused },
        "Select Unused"
      )
    ),
    React.createElement(
      "div",
      { className: "selection-info" },
      `${selectedIds.size} selected — ${affectedNoteCount} note(s) affected`
    ),
    React.createElement(
      "div",
      { className: "tag-list" },
      sortedTags.map((tag) =>
        React.createElement(
          "label",
          {
            key: tag._id,
            className: "tag-item",
          },
          React.createElement("input", {
            type: "checkbox",
            checked: selectedIds.has(tag._id),
            onChange: () => toggleTag(tag._id),
          }),
          React.createElement("span", {
            className: "tag-color-dot",
            style: {
              backgroundColor: tag.color || DEFAULT_TAG_COLOR,
            },
          }),
          React.createElement("span", { className: "tag-name" }, tag.name),
          React.createElement(
            "span",
            { className: "tag-count" },
            `${tag._noteCount || 0} note(s)`
          )
        )
      )
    ),
    React.createElement(
      "div",
      { className: "actions" },
      React.createElement(
        "button",
        { className: "ui button", onClick: closeDialog },
        "Close"
      ),
      React.createElement(
        "button",
        {
          className: "ui red button",
          onClick: handleDelete,
          disabled: selectedIds.size === 0 || deleting,
        },
        deleting ? "Deleting..." : "Delete Selected"
      )
    )
  );
};

MultiTagDeleteDialog.displayName = "MultiTagDeleteDialog";

module.exports = MultiTagDeleteDialog;
