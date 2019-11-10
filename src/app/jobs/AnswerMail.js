import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class AnswerMail {
  get key() {
    return 'AnswerMail';
  }

  async handle({ data }) {
    const { informationMail } = data;

    const { student, helper } = informationMail;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Pedido de auxílio respondido.',
      template: 'answer',
      context: {
        student: student.name,
        question: helper.question,
        answer: helper.answer,
        dateAnswer: format(
          parseISO(helper.answer_at),
          "'dia' dd 'de' MMMM 'de' yyyy ', às ' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new AnswerMail();
