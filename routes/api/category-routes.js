const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findAll({
      include: [
        {model: Product},
      ],
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [
        {model: Product},
      ],
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', (req, res) => {
  // create a new category
  Category.create(req.body)
  .then((category) => {
    if (req.body.Id.length) {
      const categoryIdArr = req.body.Id.map((category_id) => {
        return {
          category_id: category.id,
        };
      });
      return Category.bulkCreate(categoryIdArr);
    }
    res.status(200).json(category);
  })
  .then((categoryIds) => res.status(200).json(categoryIds))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
  Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
  .then((updatedCategory) => {
    return Category.findAll({
    });
  })
  .then((category) => {
    const categoryIds = category.map(({category_id}) => category_id);

    const newCategory = req.body.categoryIds
    .filter((category_id) => !categoryIds.include(category_id))
    .map((category_id) => {
      return {
        category_id,
      };
    });

    const categoryToRemove = category
    .filter(({category_id}) => !req.body.categoryIds.includes(category_id))
    .map(({id}) => id); 

    return Promise.all([
      Category.destroy({ where: {id: categoryToRemove}}),
      Category.bulkCreate(newCategory),
    ]);
  })
  .then((updatedCategory) => res.json(updatedCategory))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
  Category.destroy({
    where: {
      id: req.params.id
    }
  })
  .then((category) => {
    return Category.findAll({
      where: {
        id: req.params.id
      }
    });
  })
  .then((category) => {
    const categoryIds = category.map(({id}) => id);
    return Category.destroy({
      where: {
        id: categoryIds
      }
    });
  })
  .then((deletedCategory) => res.json(deletedCategory))
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

module.exports = router;
