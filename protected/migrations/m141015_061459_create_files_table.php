<?php

class m141015_061459_create_files_table extends CDbMigration
{
    public function safeUp()
    {
        $this->createTable('files', [
            'id' => 'serial',
            'file_id' => 'integer NOT NULL',
            'src' => 'VARCHAR(1000) NOT NULL',
            'date_change' => 'TIMESTAMP',
            'CONSTRAINT pk_files_id PRIMARY KEY (id)',
            'CONSTRAINT uq_files_file_id UNIQUE (file_id)',
        ]);
    }

    public function safeDown()
    {
        $this->dropTable('files');
    }
}