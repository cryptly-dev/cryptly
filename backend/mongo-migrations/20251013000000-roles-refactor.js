module.exports = {
  async up(db) {
    const projects = await db.collection('projects').find({}).toArray();

    for (const project of projects) {
      const newMembers = {};

      for (const [memberId, role] of Object.entries(project.members)) {
        if (role === 'owner') {
          newMembers[memberId] = 'admin';
        } else if (role === 'admin') {
          newMembers[memberId] = 'write';
        } else if (role === 'member') {
          newMembers[memberId] = 'read';
        } else {
          newMembers[memberId] = role;
        }
      }

      await db
        .collection('projects')
        .updateOne({ _id: project._id }, { $set: { members: newMembers } });
    }

    const invitations = await db.collection('invitations').find({}).toArray();

    for (const invitation of invitations) {
      let newRole = invitation.role;

      if (invitation.role === 'admin') {
        newRole = 'write';
      } else if (invitation.role === 'member') {
        newRole = 'read';
      }

      await db
        .collection('invitations')
        .updateOne({ _id: invitation._id }, { $set: { role: newRole } });
    }
  },

  async down(db) {
    // not needed
  },
};
