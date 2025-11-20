// check-fileable-types.js
const { sequelize } = require('../database/db');

async function checkFileableTypes() {
    try {
        console.log('🔍 Проверяем значения fileable_type в БД:\n');

        // 1. Проверим все уникальные значения fileable_type
        const typesQuery = `
            SELECT DISTINCT fileable_type, COUNT(*) as count 
            FROM files 
            GROUP BY fileable_type 
            ORDER BY count DESC
        `;
        const types = await sequelize.query(typesQuery, {
            type: sequelize.QueryTypes.SELECT
        });

        console.log('1. Уникальные значения fileable_type:');
        types.forEach(type => {
            console.log(`   - "${type.fileable_type}": ${type.count} файлов`);
        });

        // 2. Проверим файлы для конкретного материала
        const materialId = 1429; // замените на ваш ID материала
        const filesQuery = `
            SELECT * FROM files 
            WHERE fileable_id = $1 
            ORDER BY fileable_type, id
        `;
        const files = await sequelize.query(filesQuery, {
            bind: [materialId],
            type: sequelize.QueryTypes.SELECT
        });

        console.log(`\n2. Файлы для материала ID ${materialId}:`);
        if (files.length > 0) {
            files.forEach(file => {
                console.log(`   - ID: ${file.id}, Name: ${file.name}, Type: "${file.fileable_type}"`);
            });
        } else {
            console.log('   ❌ Файлы не найдены');
        }

        // 3. Проверим scope ассоциации
        console.log('\n3. Scope ассоциации:', { fileable_type: 'LessonMaterial' });

    } catch (error) {
        console.error('❌ Ошибка проверки:', error);
    }
}

checkFileableTypes();