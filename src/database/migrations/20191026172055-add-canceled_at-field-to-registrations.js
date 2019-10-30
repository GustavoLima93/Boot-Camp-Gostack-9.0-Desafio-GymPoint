module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('registrations', 'canceled_at', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('registrations', 'canceled_at');
  },
};
