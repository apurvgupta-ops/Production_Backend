'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('Admin123!', salt);

        await queryInterface.bulkInsert('users', [
            {
                name: 'System Administrator',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
                phone: '+1234567890',
                is_active: true,
                email_verified_at: new Date(),
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: await bcrypt.hash('User123!', salt),
                role: 'user',
                phone: '+1234567891',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: await bcrypt.hash('User123!', salt),
                role: 'moderator',
                phone: '+1234567892',
                is_active: true,
                email_verified_at: new Date(),
                created_at: new Date(),
                updated_at: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('users', null, {});
    }
};