const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Product.findAll({
      include: [
        {model: Product},
      ],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [
        {model: Product},
      ],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', (req, res) => {
  // create a new tag
  Tag.create(req.body)
    .then((tag) => {
      if (req.body.tagIds.length) {
        const tagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            tag_id: tag.id,
          };
        });
        return Tag.bulkCreate(tagIdArr);
      }
      res.status(200).json(tag);
    })
    .then((TagIds) => res.status(200).json(TagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((updatedTag) => {
      // If tag is updated successfully
      // Find all associated products from ProductTag
      return ProductTag.findAll({
        where: { tag_id: req.params.id },
      });
    })
    .then((productTags) => {
      // Get list of current product_ids
      const productIds = productTags.map(({ product_id }) => product_id);

      // Create filtered list of new product_ids
      const newProductTags = req.body.productIds
        .filter((product_id) => !productIds.includes(product_id))
        .map((product_id) => {
          return {
            product_id,
            tag_id: req.params.id,
          };
        });

      // Create filtered list of productIds to remove
      const productTagsToRemove = productTags
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);

      // Delete all rows of the tags to be removed
      // and bulk insert new rows with the new product_id-tag_id pairs
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  Tag.destroy({
    where: {
      id: req.params.id
    }
  })
  .then((tag) => {
    return ProductTag.findAll({
      where: {
        tag_id: req.params.id
      }
    });
  })
  .then((productTags) => {
    const productTagIds = productTags.map(({ id }) => id);
    return ProductTag.destroy({
      where: {
        id: productTagIds
      }
    });
  })
  .then((deletedProductTagRows) => res.json(deletedProductTagRows))
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

module.exports = router;