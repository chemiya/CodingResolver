import Web3 from 'web3';
import React, { useState, useEffect } from 'react';
import AuctionContract from './../contracts/auction.json';
import { ContractId } from "./../contracts/contract"
import { useNavigate, useParams } from 'react-router-dom';


const CreateProblem = () => {

    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [area, setArea] = useState('');
    const [startPrice, setStartPrice] = useState();
    const [dateLimit, setDateLimit] = useState('');
    const [showError, setShowError] = useState(0)
    const navigate = useNavigate();
    const [showSpinner, setShowSpinner] = useState(0)
    const { id } = useParams();
    const [action, setAction] = useState("create")


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

                    if (id != "new") {
                        setAction("edit")
                        console.log()
                        let problem = await contractInstance.methods.getProblemById(id).call();
                        setTitle(problem[2]);
                        setDescription(problem[3]);
                        setArea(problem[6]);
                        setStartPrice(Number(problem[7]));

                        const dateLoaded = new Date(Number(problem[5]) * 1000);
                        const dd = String(dateLoaded.getDate()).padStart(2, '0');
                        const mm = String(dateLoaded.getMonth() + 1).padStart(2, '0');
                        const yyyy = dateLoaded.getFullYear();
                        const formatDate = `${yyyy}-${mm}-${dd}`;
                        setDateLimit(formatDate)
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

    const sendData = async (e) => {
        if (title == "" || description == "" || area == "" || dateLimit == "" || startPrice == undefined) {
            setShowError(1);
        } else {
            setShowSpinner(1)
            const fecha = new Date(dateLimit);
            const timestamp = Math.floor(fecha.getTime() / 1000);
            const result = await contract.methods.createProblem(title, description, area, startPrice, timestamp).send({ from: account });
            console.log("created")
            navigate('/');
        }

    };



    const editData = async (e) => {
        if (title == "" || description == "" || area == "" || dateLimit == "" || startPrice == undefined) {
            setShowError(1);
        } else {
            setShowSpinner(1)
            const fecha = new Date(dateLimit);
            const timestamp = Math.floor(fecha.getTime() / 1000);
            const result = await contract.methods.updateProblemById(id,title, description, area,  timestamp).send({ from: account });
            console.log("updated")
            navigate('/');
        }

    };





    return (
        <div>
            <div className='container'>
                <div className='row'>
                    <div className='col'>
                        {action == "create" ?
                            (<h1 className='text-center'>Create problem</h1>
                            ) : (<h1 className='text-center'>Edit problem</h1>)}

                    </div>
                </div>


                <div className='row mt-2'>
                    <div className='col-6 d-flex flex-column'>
                        <h2>Title</h2>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" class="form-control" placeholder="Brief description of the problem" ></input>
                    </div>
                </div>


                <div className='row mt-2'>
                    <div className='col-12 d-flex flex-column'>
                        <h2>Description</h2>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className='w-100' placeholder="Describe the details of the problem"> </textarea>
                    </div>
                </div>


                <div className='row mt-2'>
                    <div className='col-4 d-flex flex-column'>
                        <h2>Areas</h2>
                        <input value={area} onChange={(e) => setArea(e.target.value)} type="text" class="form-control" placeholder="Software, Hardware, Operating Systems..."  ></input>
                    </div>

                    <div className='col-4 d-flex flex-column'>
                        <h2>Date limit</h2>
                        <input value={dateLimit} onChange={(e) => setDateLimit(e.target.value)} type="date" class="form-control"   ></input>
                    </div>


                    <div className='col-4 d-flex flex-column'>
                        <h2>Start price</h2>
                        {action == "create" ?
                            (<input value={startPrice} onChange={(e) => setStartPrice(Number(e.target.value))} type="text" class="form-control" placeholder="€€€"  ></input>
                            ) : (<input value={startPrice} onChange={(e) => setStartPrice(Number(e.target.value))} type="text" class="form-control" placeholder="€€€" disabled="true" ></input>)}
                        
                    </div>
                </div>

                <div className='row mt-4'>
                    <div className='col-12 d-flex justify-content-center'>


                        {showSpinner ? (
                            <div className='spinner-div d-flex flex-column align-items-center'>
                                <div class="spinner-border mt-3" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p>Loading...</p>
                            </div>

                        ) : (
                            <div>
                            {action == "create" ?
                            (<button onClick={sendData} className='buttom-create'>Create problem</button>
                            ) : (<button onClick={editData} className='buttom-create'>Edit problem</button>)}
                            </div>
                            
                        )}

                    </div>
                </div>

                <div className='row'>
                    <div className='col-12 d-flex justify-content-center'>
                        {showError ? (
                            <p className='text-center error'>Please, complete all fields</p>
                        ) :
                            (
                                <h1></h1>
                            )}
                    </div>
                </div>
            </div>

        </div>
    );
}


export default CreateProblem;