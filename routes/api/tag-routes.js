const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll({
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

router.post('/', async (req, res) => {
  try {
    const tag = await Tag.create({
      tag_name: req.body.tag_name
    });
    
    if (req.body.tagIds) {
      const tagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          tag_id: tag.id,
        };
      });
      
      await Tag.bulkCreate(tagIdArr);
      const TagIds = tagIdArr.map(tag => tag.tag_id);
      res.status(200).json(TagIds);
    } else {
      res.status(200).json(tag);
    }
    
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedTag = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (!updatedTag[0]) {
      res.status(404).json({ message: 'No tag found with this id' });
      return;
    }
    res.json(updatedTag);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const tag = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });
    if (!tag) {
      res.status(404).json({ message: 'No tag found with this id' });
      return;
    }
    res.json(tag);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;