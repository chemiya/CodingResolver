// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;



contract AuctionProblems{


    //constants
    uint16 public MAX_PROBLEM_LENGTH = 280;
    uint16 public MAX_TITLE_LENGTH = 150;
    uint16 public MAX_AREA_LENGTH = 100;
    string public PENDING="Pending";
    string public WORKING="Working";
    string public FINISHED="Finished";






    //structs
    struct Problem{
        uint256 id;
        address author;
        string title;
        string description;
        uint256 timestampCreation;
        uint256 timestampLimit;
        string area;
        uint256 price;
        string state;
        
    }

    struct Offer{
        uint256 idProblem;
        address author;
        uint256 value;
    }


    struct UserInformation{
        uint256 expPoints;
        uint256 karma;
        address user;
    }





    //arrays
    Offer[] public auctionPrices;//array to store the offers created to a problem
    Problem[] public problems;//array to store the problems created by users
    UserInformation[] public usersInformations;//array to store the users information




    //events
    event ProblemCreated(uint256 id, address author, string title,string area, uint256 timestamp);
    event OfferCreated(uint256 idProblem, address author, uint256 value );
    event AuctionFinished(uint256 idProblem, address author);
    event ProblemClosed(uint256 idProblem, address author);
    event AuctionRestarted(uint256 idProblem, address author);








    //creating a problem
    function createProblem(string memory _title, string memory _description, string memory _area, uint256 _startPrice, uint256  _dateLimit) public {
        
        //validation
        require(bytes(_description).length <= MAX_PROBLEM_LENGTH, "Too long description" );
        require(bytes(_title).length <= MAX_TITLE_LENGTH, "Too long title" );
        require(bytes(_title).length <= MAX_AREA_LENGTH, "Too long area" );
        require(_startPrice > 0, "Start price must be bigger than 0");
        require(_dateLimit > block.timestamp, "Limit date must be after this moment");
        
        //create the problem
        Problem memory newProblem = Problem({
            id: problems.length,
            author: msg.sender,
            title: _title,
            area:_area,
            description:_description,
            timestampCreation: block.timestamp,
            price:_startPrice,
            state: PENDING,
            timestampLimit:_dateLimit
        });

        //store in array
        problems.push(newProblem);

        //event
        emit ProblemCreated(newProblem.id, newProblem.author, newProblem.title, newProblem.area, newProblem.timestampCreation);
    }












    //creating an offer
    function createOffer(uint256 _value, uint256 _problem) public {

        //validation
        require(_value >0, "The value of the offer must be bigger than 0" );

        for (uint256 i = 0; i < problems.length; i++) {
            if(problems[i].id==_problem){
                require(msg.sender != problems[i].author,"You cannot make an offer on a problem that you created");
            }
            if(problems[i].id==_problem){
                require(compareStrings(problems[i].state, PENDING), "You can only make offers to pending problems");
            }
            if(problems[i].id==_problem){
                require(_value<problems[i].price, "The value of the offer must be smaller than the lower offer");
            }
        }

        //create the offer
        Offer memory newOffer=Offer({
            idProblem: _problem,
            author: msg.sender,
            value:_value
        });

        //store in array
        auctionPrices.push(newOffer);

        //update the min price if it is necessary
        for (uint256 i = 0; i < problems.length; i++) {
            if(problems[i].id==_problem){
                if(problems[i].price>_value){
                    problems[i].price=_value;
                }
            }
        }

        //event
        emit OfferCreated(newOffer.idProblem,newOffer.author,newOffer.value);
        
    }











    //finish the auction and starting working
    function finishAuction(uint256 _idProblem) public returns (string memory message){
        uint256 countBids=0;
        for (uint256 i = 0; i < auctionPrices.length; i++) {
            if(auctionPrices[i].idProblem==_idProblem){
                countBids++;
            }
        }

        require(countBids>0,"To finish the auction, there must be at less one bid");



        //search the problem
        for (uint256 i = 0; i < problems.length; i++) {
            if (problems[i].id == _idProblem) {

                //validation
                require(compareStrings(problems[i].state, PENDING), "The problem must be pending to finish the auction");
                require(msg.sender==problems[i].author,"Only the author of the problem can finish the auction");

                //change state
                problems[i].state = WORKING;
                return "The problem now is in working state";
            }
        }

        //event
        emit AuctionFinished(_idProblem,msg.sender);
        return "We couldn't change the status of the problem";
    }













    //get the minimum offer of a problem
    function getMinimumOffer( uint _problem) public view returns (Offer memory) {
        uint minOffer=99999;
        address winner;

        //search bids in the auction of the problem comparing with the minimum
        for (uint256 i = 0; i < auctionPrices.length; i++) {
            if(auctionPrices[i].idProblem==_problem){
                if(auctionPrices[i].value<minOffer){
                    minOffer=auctionPrices[i].value;
                    winner=auctionPrices[i].author;
                }
            }
        }

        //return winner offer
        Offer memory winnerOffer=Offer({
            idProblem: _problem,
            value: minOffer,
            author:winner
        });
        return winnerOffer;
    }













    //closing a problem
    function closeProblem(uint256 _idProblem) public returns (string memory message){

        //search the problem
        for (uint256 i = 0; i < problems.length; i++) {
            if (problems[i].id == _idProblem) {

                //validation
                require(compareStrings(problems[i].state, WORKING), "The problem must be in working state to finish it");
                require(msg.sender==problems[i].author,"Only the author of the problem can close the problem");


                //change state
                problems[i].state = FINISHED;

                //get information of the minimum offer
                Offer memory minimum=getMinimumOffer(_idProblem);
                address userMinimum=minimum.author;
                uint256 find=0;

                //update user information
                for (uint256 j = 0; j < usersInformations.length; j++) {
                    if(usersInformations[j].user==userMinimum){
                        usersInformations[j].expPoints++;
                        if(usersInformations[j].karma<10){
                            usersInformations[j].karma++;
                        }
                        find=1;
                        break;
                    }
                }
                //if user doesn't exist
                if(find==0){
                    UserInformation memory user=UserInformation({
                        user: userMinimum,
                        expPoints: 1,
                        karma:6
                    });
                    usersInformations.push(user);
                }
                return "The problem now is finished";
            }
        }

        //event
        emit ProblemClosed(_idProblem,msg.sender);
        return "We couldn't change the status of the problem";
    }











    //reopening auction a problem
    function restartAuctionProblem(uint256 _idProblem) public returns (string memory message){
        
        //search the problem
        for (uint256 i = 0; i < problems.length; i++) {
            if (problems[i].id == _idProblem) {

                //validation
                require(compareStrings(problems[i].state, WORKING), "The problem must be in working state to restart the auction");
                require(msg.sender==problems[i].author,"Only the author of the problem can restart the auction");

                //change state
                problems[i].state = PENDING;

                //get information of minimum offer
                Offer memory minimum=getMinimumOffer(_idProblem);
                address userMinimum=minimum.author;
                uint256 find=0;

                //update user information
                for (uint256 j = 0; j < usersInformations.length; j++) {
                    if(usersInformations[j].user==userMinimum){
                        if(usersInformations[j].karma>0){
                            usersInformations[j].karma--;
                        }
                        find=1;
                        break;
                    }
                }
                //if user doesn't exist
                if(find==0){
                    UserInformation memory user=UserInformation({
                        user: userMinimum,
                        expPoints: 0,
                        karma:4
                    });
                    usersInformations.push(user);
                }

                //delete previous bids
                for (uint256 k = 0; k < auctionPrices.length; k++) {
                    if(auctionPrices[k].idProblem==_idProblem){
                        auctionPrices[k]=auctionPrices[auctionPrices.length - 1];
                        auctionPrices.pop();
                    }
                }

                return "The problem now is pending";
            }
        }

        //event
        emit AuctionRestarted(_idProblem,msg.sender);
        return "We couldn't change the status of the problem";
    }











    //delete problem by id
    function deleteProblemById(uint256 _idProblem) public returns(string memory message){
        
        //search the problem
        for (uint256 i = 0; i < problems.length; i++) {
            if (problems[i].id == _idProblem) {

                    //validation
                    require(!compareStrings(problems[i].state, WORKING), "You cannot delete a problem in which you are working");
                    require(msg.sender==problems[i].author,"Only the author of the problem can delete the problem");

                    //delete the problem
                    problems[i]=problems[problems.length - 1];
                    problems.pop();


                    //delete  bids
                    for (uint256 k = 0; k < auctionPrices.length; k++) {
                        if(auctionPrices[k].idProblem==_idProblem){
                            auctionPrices[k]=auctionPrices[auctionPrices.length - 1];
                            auctionPrices.pop();
                        }
                    }

                    return "Problem deleted succesfully";
            }
        }
        return "We couldn't delete the problem";
    }








    //update problem by id
    function updateProblemById(uint256 _idProblem, string memory _title, string memory _description, string memory _area,uint256  _dateLimit) public returns(string memory message){
        
        //search the problem
        for (uint256 i = 0; i < problems.length; i++) {
            if (problems[i].id == _idProblem) {

                    //validation
                    require(compareStrings(problems[i].state, PENDING), "You only can update a problem when it is pending");
                    require(msg.sender==problems[i].author,"Only the author of the problem can update the problem");

                    //update attributes
                    problems[i].title=_title;
                    problems[i].description=_description;
                    problems[i].area=_area;
                    problems[i].timestampLimit=_dateLimit;
                    return "Problem updated succesfully";
            }
        }
        return "We couldn't update the problem";
    }






    //get all the problems
    function getProblems() public view returns (Problem[] memory) {
        uint256 problemsCount=0;

        //count problems pending and not expired
        for (uint256 i = 0; i < problems.length; i++) {
            if(compareStrings(problems[i].state,PENDING)){
                if(block.timestamp<problems[i].timestampLimit){
                    problemsCount++;
                }

            }
        }

        //store the problems to return 
        Problem[] memory problemsFiltered = new Problem[](problemsCount);
        uint256 index = 0;
        for (uint256 i = 0; i < problems.length; i++) {
            if(compareStrings(problems[i].state,PENDING)){
                if(block.timestamp<problems[i].timestampLimit){
                    problemsFiltered[index] = problems[i];
                    index++;
                }
            }
        }
        return problemsFiltered;
    }











    //get my problems
    function getMyProblems(address _author) public view returns (Problem[] memory) {
        uint256 filteredProblems = 0;
        
        //count problems created by me
        for (uint256 i = 0; i < problems.length; i++) {
            if (problems[i].author == _author) {
                filteredProblems++;
            }
        }

        //store the problems to return 
        Problem[] memory problemsFiltered = new Problem[](filteredProblems);
        uint256 index = 0;
        for (uint256 i = 0; i < problems.length; i++) {
            if (problems[i].author == _author) {
                problemsFiltered[index] = problems[i];
                index++;
            }
        }
        return problemsFiltered;
    }








    //compare strings
    function compareStrings(string storage a, string storage b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }








    //get problem by id
    function getProblemById(uint256 _idProblem) view public returns(Problem memory problem){
        
        //search the problem
        for (uint256 i = 0; i < problems.length; i++) {
            if(problems[i].id==_idProblem){
                return problems[i];
            }
        }
    }











    
    //get offers of a problem
    function getOffersProblem(uint256 _idProblem) public view returns (Offer[] memory) {
        uint256 filteredOffers = 0;

        //count bids of the auction of the problem
        for (uint256 i = 0; i < auctionPrices.length; i++) {
            if (auctionPrices[i].idProblem == _idProblem) {
                filteredOffers++;
            }
        }

        //store bids to return
        Offer[] memory offersFiltered = new Offer[](filteredOffers);
        uint256 index = 0;
        for (uint256 i = 0; i < auctionPrices.length; i++) {
            if (auctionPrices[i].idProblem == _idProblem) {
                offersFiltered[index] = auctionPrices[i];
                index++;
            }
        }
        return offersFiltered;
    }














    //get user information
    function getUserInformationByAddress(address _user) public returns(UserInformation memory userInformation){
        uint256 find=0;

        //search user
        for (uint256 i = 0; i < usersInformations.length; i++) {
            if(usersInformations[i].user==_user){
                return usersInformations[i];
            }
        }


        //if user doesn't exist
        if(find==0){
            UserInformation memory user=UserInformation({
                user: _user,
                expPoints: 0,
                karma:5
            });
            usersInformations.push(user);
            return usersInformations[usersInformations.length-1];
        }
    }










}