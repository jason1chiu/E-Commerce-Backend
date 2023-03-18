const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Product.finallAll({
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
    .then((tag) => {
      return Tag.findAll({ 
        where: {id: req.params.id}
      })
        .then((tags) => {
          const tagIds = tags.map(({id}) => id);
          const newTags = req.body.tagIds
            .filter((tag_id) => !tagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: tag.id,
                tag_id,
              };
            });
          const tagsToRemove = tags
            .filter(({id}) => !req.body.tagIds.includes(id))
            .map(({id}) => id);

          return Promise.all([
            ProductTag.destroy({ where: {id: tagsToRemove}}),
            ProductTag.bulkCreate(newTags),
          ]);
        })
        .then((updatedTags) => res.json(updatedTags))
        .catch((err) => {
          console.log(err);
          res.status(400).json(err);
        });
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
