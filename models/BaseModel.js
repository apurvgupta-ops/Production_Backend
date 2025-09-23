import mongoose from 'mongoose';

/**
 * Base model class with common fields and methods
 */
class BaseModel {
    static addTimestamps(schema) {
        schema.add({
            createdAt: {
                type: Date,
                default: Date.now,
                immutable: true
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        });

        schema.pre('save', function (next) {
            this.updatedAt = Date.now();
            next();
        });

        schema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
            this.set({ updatedAt: Date.now() });
            next();
        });
    }

    static addSoftDelete(schema) {
        schema.add({
            isDeleted: {
                type: Boolean,
                default: false
            },
            deletedAt: {
                type: Date,
                default: null
            }
        });

        schema.pre(/^find/, function (next) {
            this.find({ isDeleted: { $ne: true } });
            next();
        });
    }
}

export default BaseModel;
