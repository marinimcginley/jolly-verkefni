const {
  addEventIntoDB,
  getOneEventFromDB,
  patchEventInDB,
  deleteEventFromDB,
} = require('../DB/events');

async function addEvent(req, res) {
  const { user } = req;
  const { title, description, startTime, endTime } = req.body;

  const result = await addEventIntoDB(title, description, startTime, endTime, user.id);

  if (result.fail) {
    return res.status(400).json(result.errors);
  }

  return res.status(201).json(result.item);
}

async function getOneEvent(req, res) {
  const { user } = req;
  const { id } = req.params;

  const result = await getOneEventFromDB(user.id, id);

  if (!result.success) {
    return res.status(404).json({ error: 'item not found' });
  }

  return res.status(200).json(result.item);
}

async function patchEvent(req, res) {
  const { user } = req;
  const { id } = req.params;

  const { title, description, startTime, endTime } = req.body;

  const event = { title, description, startTime, endTime, id };

  const result = await patchEventInDB(event, user.id);

  if (!result.success && result.error) {
    return res.status(400).json(result.error);
  }

  if (!result.success && result.notFound) {
    return res.status(404).josn({ error: 'item not found' });
  }

  if (result.success && !result.notFound) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result.item);
}

async function deleteEvent(req, res) {
  const { user } = req;
  const { id } = req.params;

  const result = await deleteEventFromDB(user.id, id);

  if (result.notFound && !result.success) {
    return res.status(404).json({ error: 'item not found' });
  }

  return res.status(204).json({});
}

module.exports = {
  addEvent,
  getOneEvent,
  patchEvent,
  deleteEvent,
}