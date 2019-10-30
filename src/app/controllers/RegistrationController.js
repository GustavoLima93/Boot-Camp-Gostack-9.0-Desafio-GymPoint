import * as Yup from 'yup';
import { isBefore, addMonths, parseISO, startOfDay, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import { Op } from 'sequelize';
import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';
import Mail from '../../lib/Mail';

class RegistrationController {
  async index(req, res) {
    const schema = Yup.object().shape({
      page: Yup.number(),
    });

    if (!(await schema.isValid(req.query))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { page = 1 } = req.query;

    const startDate = startOfDay(new Date());

    const registrations = await Registration.findAll({
      where: {
        canceled_at: null,
        end_date: {
          [Op.gte]: startDate,
        },
      },
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'start_date', 'end_date', 'price', 'canceled_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    });

    return res.json(registrations);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      plan_id: Yup.number().required(),
      student_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { start_date, plan_id, student_id } = req.body;

    const registration = await Registration.findOne({ where: { student_id } });

    if (registration) {
      return res
        .status(400)
        .json({ error: 'you are already enrolled in a plan' });
    }

    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'plan not found' });
    }

    const startDate = parseISO(start_date);

    if (isBefore(startDate, new Date())) {
      return res.status(400).json({ error: ' The chosen date has passed ' });
    }

    const end_date = addMonths(startDate, plan.duration);
    const price = plan.duration * plan.price;

    const { id } = await Registration.create({
      start_date: startDate,
      end_date,
      price,
      student_id,
      plan_id,
    });

    const student = await Student.findByPk(student_id);

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matricula efetuada com sucesso',
      template: 'confirmation',
      context: {
        student: student.name,
        plan: plan.title,
        date: format(end_date, "'dia' dd 'de' MMMM', às ' H:mm'h'", {
          locale: pt,
        }),
        price,
      },
    });

    return res.json({ id, startDate, end_date, price, student_id, plan_id });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      plan_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const schemaParams = Yup.object().shape({
      id: Yup.number(),
    });

    if (!(await schemaParams.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const { start_date, plan_id } = req.body;

    const registration = await Registration.findByPk(id);

    if (!registration) {
      return res.status(400).json({ error: 'Enrolled not found' });
    }

    /**
     * checks if the plan to update is an expired plan
     */

    if (isBefore(registration.end_date, new Date())) {
      if (!start_date || !plan_id) {
        return res.status(400).json({
          error:
            'plan expired, need to inform the start date and what is the new student plan',
        });
      }
      const startDate = parseISO(start_date);

      if (isBefore(startDate, new Date())) {
        return res.status(400).json({ error: ' The chosen date has passed ' });
      }

      const plan = await Plan.findByPk(plan_id);
      if (!plan) {
        return res.status(400).json({ error: 'plan not found' });
      }

      const end_date = addMonths(parseISO(start_date), plan.duration);
      const price = plan.duration * plan.price;

      const { student_id } = await registration.update({
        start_date: startDate,
        plan_id,
        end_date,
        price,
      });

      return res.json({ student_id, start_date, plan_id, end_date, price });
    }

    /**
     * checks if the plan to update is an active plan
     */

    if (plan_id) {
      const plan = await Plan.findByPk(plan_id);
      if (!plan) {
        return res.status(400).json({ error: 'plan not found' });
      }

      const end_date = addMonths(registration.end_date, plan.duration);
      const price = plan.duration * plan.price;

      const { student_id } = await registration.update({
        start_date,
        plan_id,
        end_date,
        price,
      });

      return res.json({ student_id, start_date, plan_id, end_date, price });
    }

    return res.json({
      student_id: registration.student_id,
      start_date: registration.start_date,
      plan_id: registration.plan_id,
      end_date: registration.end_date,
      price: registration.price,
    });
  }

  async delete(req, res) {
    const schemaParams = Yup.object().shape({
      id: Yup.number(),
    });

    if (!(await schemaParams.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const registration = await Registration.findByPk(id);

    if (!registration) {
      return res.status(400).json({ error: 'Enrolled not found' });
    }

    await registration.update({ student_id: null, canceled_at: new Date() });

    return res.send();
  }
}

export default new RegistrationController();
