const { Item } = require("../models");
const {uploadCloud} = require("../libs/media.handling");

module.exports = {
  getItems: async (req, res) => {
    try {
      const items = await Item.findAll();
      return res.status(200).json({
        success: true,
        data: items
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },
  adminCreateItem: async (req, res) => {
    const {name, description, stock, price} = req.body;
    const image_url = await uploadCloud(req.file.path);

    try {
      const item = new Item();
      item.name = name;
      item.description = description;
      item.image = image_url;
      item.stock = stock;
      item.price = price;
      await item.save();
      return res.json({
        success: true,
        data: item
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({message: error.message});
    }
  },
  adminUpdateItem: async (req, res) => {
    const id = req.params.id;
    const {name, description, stock, price} = req.body;
    let image_url = req.body.image; // gunakan gambar lama jika tidak ada gambar baru yang diunggah
    if (req.file) image_url = await uploadCloud(req.file.path); // unggah gambar baru jika ada

    const item = await Item.findByPk(id);
    if (!item) return res.sendStatus(400);
    try {
      item.name = name;
      item.description = description;
      item.image = image_url;
      item.stock = stock;
      item.price = price;
      await item.save();
      res.status(200).json({success: true, message: "Item updated!", data: item});
    } catch (error) {
      return res.status(500).json({message: error.message});
    }
  },
  adminDeleteItem: async (req, res) => {
    const id = req.params.id;
    const item = await Item.findByPk(id);
    try {
      if (item != undefined) {
        await item.destroy({
          where: {
            id: id,
          },
        });
        return res.status(200).json({message: "Item deleted"});
      }
      return res.sendStatus(400);
    } catch (error) {
      return res.status(500).json({message: error.message});
    }
  },
  getDetailItem: async (req, res) => {
    try {
      const id = req.params.id
      const items = await Item.findByPk(id);
      if (items) {
        return res.status(200).json({
          success: true,
          data: items
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Item not found'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },
};
