
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import AuctionContract from './../contracts/auction.json';
import { ContractId } from "./../contracts/contract"
import Web3 from 'web3';


const ProblemDetail = () => {
    const { id } = useParams();

    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');
    const [slimAddress, setSlimAddress] = useState('');
    const [problem, setProblem] = useState();
    const [minimumOffer, setMinimumOffer] = useState();
    const [offer, setOffer] = useState();
    const [problemLoaded, setProblemLoaded] = useState(0)
    const [showSpinner, setShowSpinner] = useState(0)
    const [showError, setShowError] = useState(0)
    const [showNoOffer, setShowNoOffer] = useState(0)
    const [showAcceptOffer, setShowAcceptOffer] = useState(0)
    const [offers, setOffers] = useState([])
    const [users, setUsers] = useState([])
    useEffect(() => {
        async function init() {

            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                try {

                    await window.ethereum.enable();


                    const accounts = await web3Instance.eth.getAccounts();
                    setAccount(accounts[0]);



                    const contractInstance = new web3Instance.eth.Contract(
                        AuctionContract,
                        ContractId
                    );
                    setContract(contractInstance);
                    console.log(problemLoaded)
                    let problem = await contractInstance.methods.getProblemById(id).call();

                    const dateLoaded = new Date(Number(problem[5]) * 1000);
                    const dd = String(dateLoaded.getDate()).padStart(2, '0');
                    const mm = String(dateLoaded.getMonth() + 1).padStart(2, '0');
                    const yyyy = dateLoaded.getFullYear();
                    const formatDate = `${dd}/${mm}/${yyyy}`;
                    problem[5] = formatDate


                    let minimumOffer = await contractInstance.methods.getMinimumOffer(id).call();
                    minimumOffer[2] = Number(minimumOffer[2])
                    if (minimumOffer[2] == 99999) {
                        setShowNoOffer(1)
                    }
                    setMinimumOffer(minimumOffer)
                    console.log(minimumOffer)
                    console.log(problem)
                    problem[7] = Number(problem[7])
                    setProblemLoaded(1)
                    setProblem(problem)
                    let slimAddress = minimumOffer[1].slice(0, 6) + "..." + minimumOffer[1].slice(minimumOffer[1].length - 5, minimumOffer[1].length)
                    setSlimAddress(slimAddress)
                    let users_array = []

                    let offers = await contractInstance.methods.getOffersProblem(id).call();
                    for (let i = 0; i < offers.length; i++) {
                        offers[i][2] = Number(offers[i][2])
                        let slimAddressOffer = offers[i][1].slice(0, 6) + "..." + offers[i][1].slice(offers[i][1].length - 5, offers[i][1].length)
                        offers[i][3] = slimAddressOffer

                        let userInformation = await contractInstance.methods.getUserInformationByAddress(offers[i][1]).call();
                        userInformation[1] = Number(userInformation[1])
                        userInformation[0] = Number(userInformation[0])
                        users_array.push(userInformation)

                    }


                    setUsers(users_array)
                    setOffers(offers)
                    console.log(offers)





                    if (problem[8] == "Pending") {

                        setShowAcceptOffer(1)
                    }




                } catch (error) {
                    console.error('Error al conectar con MetaMask:', error);
                }
            } else {
                console.error('MetaMask no está instalado');
            }
        }

        init();
    }, []);


    const createOffer = async (e) => {
        console.log(offer)
        if (offer <= 0 || offer >= minimumOffer[2] || offer == undefined) {
            console.log("The offer must be greater than 0 and smaller than the minimum offer")
            setShowError(1)
        } else {
            setShowSpinner(1)
            let result = await contract.methods.createOffer(offer, id).send({ from: account });
            console.log(result)
            setShowSpinner(0)
            setShowError(0)
            window.location.reload();

        }

    };





    return (
        <div>




            <div className='container'>
                <div className='row'>
                    <div className='col'>
                        <h1 className='text-center'>Details of the problem</h1>
                    </div>
                </div>



                {problemLoaded ? (
                    <div className='row mt-3'>
                        <div className='col'>
                            <div className='problem-details-extended'>



                                {/**data on first row */}
                                <div className='row '>
                                    <div className='col-6 d-flex'>
                                        <div className=' w-25 d-flex justify-content-center align-items-center'>
                                            <i className="fa-solid fa-triangle-exclamation icon"></i>
                                        </div>
                                        <div className='text w-75 '>
                                            <h2>{problem[2]}</h2>
                                        </div>
                                    </div>


                                    <div className='col-6 d-flex'>
                                        <div className=' w-25 d-flex justify-content-center align-items-center'>
                                            <i className="fa-solid fa-laptop icon"></i>
                                        </div>
                                        <div className='text w-75 '>
                                            <h2>{problem[6]}</h2>
                                        </div>
                                    </div>
                                </div>




                                {/**data on second row */}
                                <div className='row mt-3'>
                                    <div className='col-12 d-flex'>
                                        <div className=' reduced-width d-flex justify-content-center align-items-center'>
                                            <i className="fa-solid fa-comment icon"></i>
                                        </div>
                                        <div className='text '>
                                            <h2>{problem[3]}</h2>
                                        </div>
                                    </div>
                                </div>







                                {/**data on third row */}
                                <div className='row mt-3'>
                                    <div className='col-6 d-flex'>
                                        <div className=' w-25 d-flex justify-content-center align-items-center'>
                                            <i className="fa-solid fa-calendar-days icon"></i>
                                        </div>
                                        <div className='text w-75 '>
                                            <h2>{problem[5]}</h2>
                                        </div>
                                    </div>


                                    <div className='col-6 d-flex'>
                                        <div className=' w-25 d-flex justify-content-center align-items-center'>
                                            <i className="fa-solid fa-euro-sign icon"></i>
                                        </div>
                                        <div className='text w-75 '>
                                            {showNoOffer ? (
                                                <h2>Start price: {problem[7]}</h2>
                                            ) : (
                                                <h2>{minimumOffer[2]}€ made by {slimAddress}</h2>
                                            )}

                                        </div>
                                    </div>
                                </div>



                                <div className='row mt-3'>
                                    <div className='col-12 d-flex'>
                                        <div className=' reduced-width d-flex justify-content-center align-items-center'>
                                            <i className="fa-solid fa-clipboard-question icon"></i>
                                        </div>
                                        <div className='text '>
                                            <h2>{problem[8]}</h2>
                                        </div>
                                    </div>
                                </div>








                            </div>

                        </div>
                    </div>
                ) : (
                    <h1></h1>
                )}

                {showNoOffer ? (
                    <div className='row'>
                        <div className='col'>
                            <div className='row'>
                                <div className='col mt-3'>
                                    <h1 className='text-center'>Offers made by users</h1>
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col'>
                                    <h2 className='text-center'>There is no offers!</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                ) : (

                    <div className='row'>
                        <div className='col'>
                            <div className='row'>
                                <div className='col mt-3'>
                                    <h1 className='text-center'>Offers made by users</h1>
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col'>
                                    {offers.map((element, index) => (

                                        <div className="row offer mt-4">
                                            <div className='col-6 d-flex flex-column align-items-center justify-content-center'>
                                                <div className='offer-detail d-flex flex-column'>
                                                    <div className='d-flex '>
                                                        <i class="fa-solid fa-user me-2 icon"></i>
                                                        <p className='text-offer'>{element[3]}</p>
                                                    </div>
                                                    <div className='d-flex mt-2'>
                                                        <i class="fa-solid fa-briefcase me-2 icon"></i>
                                                        <p className='text-offer'>ExpPoints: {users[index][0]}</p>

                                                    </div>
                                                    <div className='d-flex mt-2'>
                                                        <i class="fa-solid fa-handshake-angle me-2 icon"></i>
                                                        <p className='text-offer'>Karma: {users[index][1]}</p>

                                                    </div>


                                                </div>
                                            </div>
                                            <div className='col-6 d-flex flex-column align-items-center justify-content-center'>
                                                <div className='offer-value d-flex align-items-center'>
                                                    <i className="fa-solid fa-euro-sign icon-price me-2"></i>
                                                    <p className='text-offer-price mt-3'>{element[2]}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                )}



                {showAcceptOffer ? (
                    <div className='row d-flex justify-content-center mt-5'>
                        <div className='col-4 d-flex flex-column align-items-center'>
                            <h1 className='text-center'>Make an offer!</h1>
                            <input value={offer} onChange={(e) => setOffer(e.target.value)} type="text" class="form-control" placeholder="€€€"  ></input>
                            {showSpinner ? (
                                <div className='spinner-div d-flex flex-column align-items-center'>
                                    <div class="spinner-border mt-3" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p>Loading...</p>
                                </div>

                            ) : (
                                <button className='buttom mt-3' onClick={createOffer}>Publish offer</button>
                            )}

                            {showError ? (
                                <p className='text-center error'>The offer must be greater than 0 and smaller than the minimum offer</p>
                            ) :
                                (
                                    <h1></h1>
                                )}


                        </div>
                    </div>
                ) : (
                    <h1 className='text-center mt-4'>Sorry! This problem no accepts more offers</h1>
                )}

            </div>

        </div>
    );
}


export default ProblemDetail;