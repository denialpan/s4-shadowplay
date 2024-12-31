import { v4 as uuidv4 } from 'uuid';

const generateTimeUUID = async () => {
    const time = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const UUID = uuidv4();
    return `${time}-${UUID}`;
}

export default generateTimeUUID;