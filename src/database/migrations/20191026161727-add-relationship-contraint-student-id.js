module.exports = {
  up: queryInterface => {
    return queryInterface.addConstraint('registrations', ['student_id'], {
      type: 'foreign key',
      name: 'registrations_student_id_fkey',
      references: {
        table: 'students',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  down: queryInterface => {
    return queryInterface.removeConstraint(
      'registrations',
      'registrations_student_id_fkey'
    );
  },
};
