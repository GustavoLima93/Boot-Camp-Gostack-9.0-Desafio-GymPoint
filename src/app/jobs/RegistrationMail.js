import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { informationMail } = data;

    const { student, plan, end_date, price } = informationMail;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matricula efetuada com sucesso',
      template: 'confirmation',
      context: {
        student: student.name,
        plan: plan.title,
        date: format(
          parseISO(end_date),
          "'dia' dd 'de' MMMM 'de' yyyy ', às ' H:mm'h'",
          {
            locale: pt,
          }
        ),
        price,
      },
    });
  }
}

export default new RegistrationMail();
