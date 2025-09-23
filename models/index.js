import { sequelize } from '../config/database.js';
import User, { UserModelDefinition } from './User.js';

// Initialize User model
User.init(UserModelDefinition.attributes, {
    ...UserModelDefinition.options,
    sequelize
});

// Import all models here
const models = {
    User
};

// Define associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Add sequelize instance and Sequelize constructor to models
models.sequelize = sequelize;
models.Sequelize = sequelize.Sequelize;

export default models;
export { User, sequelize };