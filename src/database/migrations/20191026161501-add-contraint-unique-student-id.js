module.exports = {
  up: queryInterface => {
    return queryInterface.addConstraint('registrations', ['student_id'], {
      type: 'unique',
      name: 'add_contraint_unique_student_id',
    });
  },

  down: queryInterface => {
    return queryInterface.removeConstraint(
      'registrations',
      'add_contraint_unique_student_id'
    );
  },
};
