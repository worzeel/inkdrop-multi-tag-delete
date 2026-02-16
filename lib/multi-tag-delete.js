"use strict";

module.exports = {
  activate() {
    const MultiTagDeleteDialog = require("./multi-tag-delete-dialog");
    inkdrop.components.registerClass(MultiTagDeleteDialog);
    inkdrop.layouts.addComponentToLayout("modal", "MultiTagDeleteDialog");
  },

  deactivate() {
    inkdrop.layouts.removeComponentFromLayout("modal", "MultiTagDeleteDialog");
    inkdrop.components.deleteClass("MultiTagDeleteDialog");
  },
};
