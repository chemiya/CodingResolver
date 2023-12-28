

import { Link } from 'react-router-dom';
import Web3 from 'web3';
import React, { useState, useEffect } from 'react';
import AuctionContract from './../contracts/auction.json';
import { ContractId } from "./../contracts/contract"


const AllProblems = () => {

    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');
    const [problems, setProblems] = useState([]);
    const [noProblems, setNoProblems] = useState(0);
    const [expPoints, setExpPoints] = useState(0);
    const [karma, setKarma] = useState(0);




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
                    let problems = await contractInstance.methods.getProblems().call();
                    if (problems.length == 0) {
                        setNoProblems(1)
                    }
                    for (let i = 0; i < problems.length; i++) {
                        problems[i][7] = Number(problems[i][7])


                        const dateLoaded = new Date(Number(problems[i][5]) * 1000);
                        const dd = String(dateLoaded.getDate()).padStart(2, '0');
                        const mm = String(dateLoaded.getMonth() + 1).padStart(2, '0');
                        const yyyy = dateLoaded.getFullYear();
                        const formatDate = `${dd}/${mm}/${yyyy}`;
                        problems[i][5] = formatDate

                    }
                    console.log(problems)
                    setProblems(problems)


                    let userInformation = await contractInstance.methods.getUserInformationByAddress(accounts[0]).call();

                    console.log(userInformation)
                    setExpPoints(Number(userInformation[0]))
                    setKarma(Number(userInformation[1]))


                } catch (error) {
                    console.error('Error al conectar con MetaMask:', error);
                }
            } else {
                console.error('MetaMask no está instalado');
            }
        }

        init();
    }, []);












    return (
        <div>



            {/*navbar */}
            <nav class="navbar navbar-expand-lg ">
                <div class="container-fluid">
                    <a class="navbar-brand">CodingResolver</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ms-auto ">
                            <li class="nav-item me-3 pt-2 d-flex flex-column justify-content-center">
                                <a class="nav-link"  >
                                    <div className='userInformation d-flex align-items-center justify-content-around'>
                                        <i class="fa-solid fa-briefcase me-2"></i>
                                        <p className='pt-2'>ExpPoints: {expPoints}</p>
                                    </div></a>
                            </li>
                            <li class="nav-item me-3 pt-2 d-flex flex-column justify-content-center">
                                <a class="nav-link"  >
                                    <div className='userInformation d-flex align-items-center justify-content-around'>
                                        <i class="fa-solid fa-handshake-angle me-2"></i>
                                        <p className='pt-2'>Karma: {karma}</p>
                                    </div></a>
                            </li>
                            <li class="nav-item d-flex flex-column justify-content-center">
                                <a class="nav-link"  ><Link className="link" to={'/createProblem/new'}>Create Problem</Link></a>
                            </li>
                            <li class="nav-item d-flex flex-column justify-content-center">
                                <a class="nav-link" ><Link className="link" to={'/myProblems'}>My Problems</Link></a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>





            {/*Problems published */}
            <div className='container mt-5'>
                <div className='row'>
                    <div className='col'>
                        <h1 className='text-center'>Problems published</h1>
                    </div>
                </div>



                {noProblems ? (
                    <h2 className='text-center mt-3'>There is no problems yet!</h2>
                ) : (
                    <div className="row">
                        {/*problem */}
                        {problems.map((element, index) => (
                            <div className='col-4'>
                                <Link className='link-problem' to={`/problemDetail/${element[0]}`}>
                                    <div className='detail-problem p-3'>
                                        {/*title */}
                                        <div className='row-detail d-flex '>
                                            <div className='element-row w-25 d-flex justify-content-center align-items-center'>
                                                <i className="fa-solid fa-triangle-exclamation icon"></i>
                                            </div>
                                            <div className='element-row w-75'>
                                                <h2>{element[2]}</h2>
                                            </div>
                                        </div>



                                        {/*area */}
                                        <div className='row-detail d-flex '>
                                            <div className='element-row w-25 d-flex justify-content-center align-items-center'>
                                                <i className="fa-solid fa-laptop icon"></i>
                                            </div>
                                            <div className='element-row w-75'>
                                                <h2>{element[6]}</h2>
                                            </div>
                                        </div>




                                        {/*date */}
                                        <div className='row-detail d-flex '>
                                            <div className='element-row w-25 d-flex justify-content-center align-items-center'>
                                                <i className="fa-solid fa-calendar-days icon"></i>
                                            </div>
                                            <div className='element-row w-75'>
                                                <h2>{element[5]}</h2>
                                            </div>
                                        </div>





                                        {/*price */}
                                        <div className='row-detail d-flex '>
                                            <div className='element-row w-25 d-flex justify-content-center align-items-center'>
                                                <i className="fa-solid fa-euro-sign icon"></i>
                                            </div>
                                            <div className='element-row w-75'>
                                                <h2>{element[7]}</h2>
                                            </div>
                                        </div>

                                    </div>
                                </Link>

                            </div>
                        ))}




                    </div>

                )}

            </div>







        </div>
    );
}


export default AllProblems;
