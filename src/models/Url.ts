import sequelize from "../db";
import { DataTypes } from 'sequelize';

const Url = sequelize.define('Url', {
    short_url: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    original_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true
}
);

export default Url;
