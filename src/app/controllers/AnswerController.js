import * as Yup from 'yup';

import AnswerMail from '../jobs/AnswerMail';
import Queue from '../../lib/Queue';
import Helper from '../models/Helper';
import Student from '../models/Student';

class AnswerController {
  async index(req, res) {
    const schema = Yup.object().shape({
      page: Yup.number(),
    });

    if (!(await schema.isValid(req.query))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { page = 1 } = req.query;

    const answer = await Helper.findAll({
      where: { answer: null },
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(answer);
  }

  async store(req, res) {
    const schemaParms = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schemaParms.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const helper = await Helper.findByPk(id);

    if (!helper) {
      return res.status(400).json({ error: 'Question does not exist' });
    }

    if (helper.answer) {
      return res.status(400).json({ error: 'Question already answered' });
    }

    const { answer } = req.body;

    const { student_id } = await helper.update({
      answer,
      answer_at: new Date(),
    });

    const student = await Student.findByPk(student_id);

    const informationMail = { student, helper };

    await Queue.add(AnswerMail.key, { informationMail });

    return res.json(helper);
  }
}

export default new AnswerController();
