'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            role: {
                type: Sequelize.ENUM('user', 'admin', 'moderator'),
                allowNull: false,
                defaultValue: 'user'
            },
            phone: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            date_of_birth: {
                type: Sequelize.DATEONLY,
                allowNull: true
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            last_login_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            email_verified_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            avatar_url: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            is_deleted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        });

        // Add indexes
        await queryInterface.addIndex('users', ['email'], {
            name: 'users_email_index',
            unique: true
        });

        await queryInterface.addIndex('users', ['role'], {
            name: 'users_role_index'
        });

        await queryInterface.addIndex('users', ['is_active'], {
            name: 'users_is_active_index'
        });

        await queryInterface.addIndex('users', ['is_deleted'], {
            name: 'users_is_deleted_index'
        });

        await queryInterface.addIndex('users', ['created_at'], {
            name: 'users_created_at_index'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};