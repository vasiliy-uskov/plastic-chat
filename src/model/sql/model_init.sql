CREATE TABLE IF NOT EXISTS file (
    file_id BINARY(16) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    creating_date TIMESTAMP NOT NULL,
    UNIQUE INDEX file_id_unique_index (file_id ASC),
    PRIMARY KEY (file_id))
    ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS user (
    user_id BINARY(16) NOT NULL,
    first_name VARCHAR(255) NULL,
    last_name VARCHAR(255) NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender TINYINT NOT NULL,
    avatar_id BINARY(16) NULL,
    PRIMARY KEY (user_id),
    UNIQUE INDEX email_unique_index (email ASC),
    UNIQUE INDEX user_id_unique_index (user_id ASC),
    FULLTEXT fulltext_user_index (first_name, last_name, email),
    INDEX avatar_id_index (avatar_id ASC),
    CONSTRAINT foreign_key_avatar_constraint
        FOREIGN KEY (avatar_id)
            REFERENCES file (file_id)
            ON DELETE SET NULL
            ON UPDATE SET NULL)
    ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS file_access_right (
    file_access_right_id BINARY(16) NOT NULL,
    file_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    file_access_right_type TINYINT NOT NULL,
    PRIMARY KEY (file_access_right_id),
    UNIQUE INDEX file_access_right_id_unique_index (file_access_right_id ASC),
    UNIQUE INDEX file_id_user_id_unique_index (file_id, user_id),
    INDEX file_foreign_key_index (file_id ASC),
    INDEX user_foreign_key_index (user_id ASC),
    CONSTRAINT foreign_key_file_constraint
        FOREIGN KEY (file_id)
            REFERENCES file (file_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
    CONSTRAINT foreign_key_user_constraint
        FOREIGN KEY (user_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE)
    ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS users_relationship (
    users_relationship_id BINARY(16) NOT NULL,
    left_user_id BINARY(16) NOT NULL,
    right_user_id BINARY(16) NOT NULL,
    users_relationship_type TINYINT NOT NULL,
    PRIMARY KEY (users_relationship_id),
    INDEX left_user_foreign_key_index (left_user_id ASC),
    INDEX right_user_foreign_key_index (right_user_id ASC),
    UNIQUE INDEX users_relationship_id_unique_index (users_relationship_id ASC),
    UNIQUE INDEX left_user_id_right_user_id_unique_index (left_user_id, right_user_id),
    CONSTRAINT foreign_key_left_user_constraint
        FOREIGN KEY (left_user_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
    CONSTRAINT foreign_key_right_user_constraint
        FOREIGN KEY (right_user_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE)
    ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS chat (
    chat_id BINARY(16) NOT NULL,
    creating_date TIMESTAMP NOT NULL,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (chat_id),
    UNIQUE INDEX chat_id_unique_index (chat_id ASC))
    ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS chat_has_user (
    chat_has_user_id BINARY(16) NOT NULL,
    chat_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    INDEX user_foreign_key_index (user_id ASC),
    INDEX chat_foreign_key_index (chat_id ASC),
    PRIMARY KEY (chat_has_user_id),
    UNIQUE INDEX chat_has_user_id_unique_index (chat_has_user_id ASC),
    CONSTRAINT foreign_key_chat_constraint
        FOREIGN KEY (chat_id)
            REFERENCES chat (chat_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
    CONSTRAINT foreign_key_user_constraint
        FOREIGN KEY (user_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE)
    ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS message (
    message_id BINARY(16) NOT NULL,
    addresser_id BINARY(16) NOT NULL,
    chat_id BINARY(16) NOT NULL,
    send_date TIMESTAMP NOT NULL,
    text TEXT NOT NULL,
    PRIMARY KEY (message_id),
    UNIQUE INDEX message_id_unique_index (message_id ASC),
    INDEX addresser_foreign_key_index (addresser_id ASC),
    INDEX chat_foreign_key_index (chat_id ASC),
    INDEX send_date_index (send_date DESC),
    CONSTRAINT foreign_key_user_constraint
        FOREIGN KEY (addresser_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
    CONSTRAINT foreign_key_chat_constraint
        FOREIGN KEY (chat_id)
            REFERENCES chat (chat_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE)
    ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS message_has_file (
    message_has_file_id BINARY(16) NOT NULL,
    message_id BINARY(16) NOT NULL,
    file_id BINARY(16) NOT NULL,
    INDEX file_foreign_key_index (file_id ASC),
    INDEX message_foreign_key_index (message_id ASC),
    PRIMARY KEY (message_has_file_id),
    UNIQUE INDEX message_has_file_id_unique_index (message_has_file_id ASC),
    CONSTRAINT foreign_key_message_constraint
        FOREIGN KEY (message_id)
            REFERENCES message (message_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
    CONSTRAINT foreign_key_file_constraint
        FOREIGN KEY (file_id)
            REFERENCES file (file_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE)
    ENGINE = InnoDB;