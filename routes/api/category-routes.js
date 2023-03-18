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
    if (req.body.productIds.length) {
      const productIdArr = req.body.productIdArr.map((product_id) => {
        return {
          category_id: category.id,
          product_id,
        };
      });
      return Product.bulkCreate(productIdArr);
    }
    res.status(200).json(category);
  })
  .then((productIds) => res.status(200).json(productIds))
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
    return Product.findAll({
      where: {
        category_id: req.params.id
      }
    });
  })
  .then((products) => {
    const productIds = products.map(({id}) => id);

    const newProducts = req.body.productIds
    .filter((product_id) => !productIds.include(product_id))
    .map((product_id) => {
      return {
        category_id: req.params.id,
        product_id,
      };
    });

    const productsToRemove = products
    .filter(({id}) => !req.body.productIds.includes(id))
    .map(({id}) => id); 

    return Promise.all([
      Product.destroy({ where: {id: productsToRemove}}),
      Product.bulkCreate(newProducts),
    ]);
  })
  .then((updatedProducts) => res.json(updatedProducts))
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
    return Product.findAll({
      where: {
        category_id: req.params.id
      }
    });
  })
  .then((products) => {
    const productIds = products.map(({id}) => id);
    return Product.destroy({
      where: {
        id: productIds
      }
    });
  })
  .then((deletedProducts) => res.json(deletedProducts))
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

module.exports = router;
