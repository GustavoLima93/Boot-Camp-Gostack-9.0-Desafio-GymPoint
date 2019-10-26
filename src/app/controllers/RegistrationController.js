import Registration from '../models/Registration';

class RegistrationController {
  async store(req, res) {
    const registration = await Registration.create(req.body);
    return res.json(registration);
  }
}

export default new RegistrationController();
