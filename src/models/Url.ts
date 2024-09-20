import sequelize from "../db";
import { DataTypes, Model } from 'sequelize';

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

// Define the interface representing the attributes of the Url model
interface UrlAttributes {
    original_url: string;
    short_url: string;
}

// Extend the Sequelize Model class
export class UrlModel extends Model<UrlAttributes> implements UrlAttributes {
    public original_url!: string;
    public short_url!: string;
}

export default Url;
