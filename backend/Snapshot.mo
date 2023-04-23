import Types "Types";

module {
    type UserId = Types.User.Id;
    type TopicId = Types.Topic.Id;
    type TeamId = Types.Team.Id;
    type TopicUserVote = Types.Topic.UserVote;
    
    public type Relation = {
        #user : (UserId, Types.User.State);
        #topic : (TopicId, Types.Topic.State);
        #team :  (TeamId, Types.Team.State);
        #principalIsUser : (Principal, Types.User.Id);
        #userTeamMember : (UserId, Types.Team.Id);
        #userIsModerator : UserId;
        #userSubmitsTopic : (UserId, Types.Topic.Id);
        #userOwnsTopic : (UserId, TopicId);
        #userTopicVote : (UserId, TopicId, TopicUserVote);
    };

    public type Chunk = [Relation];

}
