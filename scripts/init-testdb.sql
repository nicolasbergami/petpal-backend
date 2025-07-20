-- scripts/init-testdb.sql
DROP USER IF EXISTS 'testuser'@'%';
CREATE USER 'testuser'@'%' IDENTIFIED BY 'testpassword';
GRANT ALL PRIVILEGES ON `testdb`.* TO 'testuser'@'%';
FLUSH PRIVILEGES;