import * as Yup from 'yup';

import Helper from '../models/Helper';
import Student from '../models/Student';

class HelperController {
  async index(req, res) {
    const schema = Yup.object().shape({
      page: Yup.number(),
    });

    if (!(await schema.isValid(req.query))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { page = 1 } = req.query;

    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const helpers = await Helper.findAll({
      where: {
        student_id: id,
      },
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(helpers);
  }

  async store(req, res) {
    const schemaParms = Yup.object().shape({
      id: Yup.number().required(),
    });

    if (!(await schemaParms.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const { question } = req.body;

    const helper = await Helper.create({ student_id: id, question });

    return res.json(helper);
  }
}

export default new HelperController();
