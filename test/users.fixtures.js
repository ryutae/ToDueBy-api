function makeUsersArray() {
    return [
      {
        id: 1,
        first_name: 'Test',
        last_name: 'User',
        email: 'test@test.com',
        password: 'P@ssw0rd'
      }
    ];
  }
  
  module.exports = {
    makeUsersArray,
  }