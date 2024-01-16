
import Web3 from 'web3';
import React, { useState, useEffect } from 'react';
import AuctionContract from './../contracts/auction.json';
import { ContractId } from "./../contracts/contract"
import { useNavigate} from 'react-router-dom';


const MyProblems = () => {


    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');
    const [problems, setProblems] = useState([]);
    const [spinner, setSpinner] = useState(0)
    const [noProblems, setNoProblems] = useState(0);
    const navigate = useNavigate();



    useEffect(() => {
        async function init() {

            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                try {

                    await window.ethereum.enable();


                    const accounts = await web3Instance.eth.getAccounts();
                    setAccount(accounts[0]);
                    console.log(accounts[0])



                    const contractInstance = new web3Instance.eth.Contract(
                        AuctionContract,
                        ContractId
                    );
                    setContract(contractInstance);
                    let problems = await contractInstance.methods.getMyProblems(accounts[0]).call();
                    if (problems.length == 0) {
                        setNoProblems(1);
                    }
                    for (let i = 0; i < problems.length; i++) {
                        problems[i][7] = Number(problems[i][7])

                        let minimumOffer = await contractInstance.methods.getMinimumOffer(problems[i][0]).call();
                        let slimAddress = minimumOffer[1].slice(0, 6) + "..." + minimumOffer[1].slice(minimumOffer[1].length - 5, minimumOffer[1].length)

                        problems[i][9] = slimAddress


                        const dateLoaded = new Date(Number(problems[i][5]) * 1000);
                        const dd = String(dateLoaded.getDate()).padStart(2, '0');
                        const mm = String(dateLoaded.getMonth() + 1).padStart(2, '0');
                        const yyyy = dateLoaded.getFullYear();
                        const formatDate = `${dd}/${mm}/${yyyy}`;
                        problems[i][5] = formatDate


                    }
                    console.log(problems)
                    setProblems(problems)





                } catch (error) {
                    console.error('Error al conectar con MetaMask:', error);
                }
            } else {
                console.error('MetaMask no está instalado');
            }
        }

        init();
    }, []);




    const finishAuction = async (id) => {
        setSpinner(1)
        let result = await contract.methods.finishAuction(id).send({ from: account });
        setSpinner(0)
        //console.log(result)
        console.log("ending")
        window.location.reload();
    };


    const closeProblem = async (id) => {
        setSpinner(1)
        let result = await contract.methods.closeProblem(id).send({ from: account });
        setSpinner(0)
        console.log(result)
        console.log("ending")
        window.location.reload();
    };


    const deleteProblem = async (id) => {
        setSpinner(1)
        let result = await contract.methods.deleteProblemById(id).send({ from: account });
        setSpinner(0)
        console.log(result)
        console.log("ending")
        window.location.reload();
    };

    const updateProblem = async (id) => {
        navigate('/createProblem/'+id);
    }

    const returnBack=()=>{
        navigate('/');
    }







    return (
        <div>
            <div className='container mt-3'>
                <div className='row'>
                    <div className='col'>
                    <button onClick={returnBack} className='buttom-return'>Return</button>
                        </div>

                </div>
            </div>


            {!spinner ? (
                <div className='container'>

                    <div className='row'>
                        <div className='col'>
                            <h1 className='text-center'>My problems</h1>
                        </div>
                    </div>

                    {noProblems ? (
                        <h2 className='text-center mt-3'>There is no problems yet!</h2>
                    ) : (
                        <div>

                            {problems.map((element, index) => (
                                <div className='row mt-4'>
                                    <div className='col'>
                                        <div className='problem-details-extended'>



                                            {/**data on first row */}
                                            <div className='row '>
                                                <div className='col-6 d-flex'>
                                                    <div className=' w-25 d-flex justify-content-center align-items-center'>
                                                        <i className="fa-solid fa-triangle-exclamation icon"></i>
                                                    </div>
                                                    <div className='text w-75 '>
                                                        <h2>{element[2]}</h2>
                                                    </div>
                                                </div>


                                                <div className='col-6 d-flex'>
                                                    <div className=' w-25 d-flex justify-content-center align-items-center'>
                                                        <i className="fa-solid fa-laptop icon"></i>
                                                    </div>
                                                    <div className='text w-75 '>
                                                        <h2>{element[6]}</h2>
                                                    </div>
                                                </div>
                                            </div>




                                            {/**data on second row */}
                                            <div className='row '>
                                                <div className='col-12 d-flex'>
                                                    <div className=' reduced-width d-flex justify-content-center align-items-center'>
                                                        <i className="fa-solid fa-comment icon"></i>
                                                    </div>
                                                    <div className='text '>
                                                        <h2>{element[3]}</h2>
                                                    </div>
                                                </div>
                                            </div>







                                            {/**data on third row */}
                                            <div className='row '>
                                                <div className='col-6 d-flex'>
                                                    <div className=' w-25 d-flex justify-content-center align-items-center'>
                                                        <i className="fa-solid fa-calendar-days icon"></i>
                                                    </div>
                                                    <div className='text w-75 '>
                                                        <h2>{element[5]}</h2>
                                                    </div>
                                                </div>


                                                <div className='col-6 d-flex'>
                                                    <div className=' w-25 d-flex justify-content-center align-items-center'>
                                                        <i className="fa-solid fa-euro-sign icon"></i>
                                                    </div>
                                                    <div className='text w-75 '>
                                                        {element[9] == "0x0000...00000" ? (
                                                            <h2>Start price: {element[7]}€</h2>
                                                        ) : (
                                                            <h2>{element[7]}€ made by {element[9]}</h2>
                                                        )}

                                                    </div>
                                                </div>

                                            </div>


                                            <div className='row '>
                                                <div className='col-12 d-flex'>
                                                    <div className=' reduced-width d-flex justify-content-center align-items-center'>
                                                        <i className="fa-solid fa-clipboard-question icon"></i>
                                                    </div>
                                                    <div className='text '>
                                                        <h2>{element[8]}</h2>
                                                    </div>
                                                </div>
                                            </div>





                                            <div className='row '>
                                                <div className='col-3 d-flex justify-content-center'>
                                                    {element[8] == "Pending" ? (
                                                        <buttom className="buttom-finish" onClick={() => finishAuction(element[0])}>Finish auction</buttom>
                                                    ) : (
                                                        <buttom className="buttom-finish-disabled" >Finish auction</buttom>
                                                    )}

                                                </div>
                                                <div className='col-3 d-flex justify-content-center'>

                                                    {element[8] == "Working" ? (
                                                        <buttom className="buttom-close" onClick={() => closeProblem(element[0])}>Close problem</buttom>
                                                    ) : (
                                                        <buttom className="buttom-finish-disabled" >Close problem</buttom>
                                                    )}
                                                </div>

                                                <div className='col-3 d-flex justify-content-center'>

                                                    {element[8] != "Working" ? (
                                                        <buttom className="buttom-update" onClick={() => updateProblem(element[0])}>Update Problem </buttom>
                                                    ) : (
                                                        <buttom className="buttom-finish-disabled" >Update Problem</buttom>
                                                    )}
                                                </div>

                                                <div className='col-3 d-flex justify-content-center'>

                                                    {element[8] != "Working" ? (
                                                        <buttom className="buttom-delete" onClick={() => deleteProblem(element[0])}>Delete problem</buttom>
                                                    ) : (
                                                        <buttom className="buttom-finish-disabled" >Delete problem</buttom>
                                                    )}
                                                </div>
                                            </div>










                                        </div>

                                    </div>
                                </div>

                            ))}

                        </div>
                    )}





                </div>
            ) : (
                <div className='spinner-div d-flex flex-column align-items-center'>
                    <div class="spinner-border mt-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading...</p>
                </div>
            )}


        </div>
    );
}


export default MyProblems;