const {
  addDateToDB,
  getDateFromDB,
  getOneDayDatesFromDB,
} = require('../DB/dates');


async function addDate(req, res) {
  const { user } = req;
  const { title, description, startTime, endTime, ids } = req.body;

  const result = await addDateToDB(user.id, title, description, startTime, endTime, ids);

  if (!result.success) {
    return res.status(400).json(result.error);
  }

  return res.status(201).json(result.item);
}

async function getDate(req, res) {
  const { user } = req;
  const { id } = req.params;

  const result = await getDateFromDB(user.id, id);

  if (!result.success) {
    return res.status(400).json(result.error);
  }

  return res.status(200).json(result.item);
}

async function getOneDayDates(req, res) {
  const { user } = req;
  const { year, month, day } = req.body;

  const result = await getOneDayDatesFromDB(year, month, day, user.id);

  if (!result.success) {
    return res.status(400).json(result.error);
  }

  return res.status(200).json(result.item);
}

module.exports = {
  addDate,
  getDate,
  getOneDayDates,
}