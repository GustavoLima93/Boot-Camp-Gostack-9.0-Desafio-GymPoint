import { subDays } from 'date-fns';
import { Op } from 'sequelize';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res) {
    const initDate = subDays(new Date(), 7);
    const lastDate = new Date();

    const frequency = await Checkin.findAll({
      where: {
        created_at: {
          [Op.between]: [initDate, lastDate],
        },
      },
    });

    if (frequency.length >= 5) {
      return res
        .status(401)
        .json({ error: 'Rest, you already attended the gym more this week' });
    }

    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const { student_id, created_at } = await Checkin.create({
      student_id: student.id,
    });

    return res.json({ student_id, created_at });
  }
}

export default new CheckinController();
