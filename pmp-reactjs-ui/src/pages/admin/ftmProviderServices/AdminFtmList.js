import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../../services/UserProfileService';
import ErrorMessage from '../../common/ErrorMessage';
import Title from '../../common/Title';
import LoadingIcon from '../../common/LoadingIcon';
import FilterButtons from '../../common/FilterButtons';
import SortingIcon from '../../common/SortingIcon';
import Pagination from '../../common/Pagination';
import viewIcon from "../../../svg/view_icon.svg";
import deactivateIcon from "../../../svg/deactivate_icon.svg";
import approveRejectIcon from "../../../svg/approve_reject_icon.svg";
import EmptyList from '../../common/EmptyList';
import AdminFtmListFilter from './AdminFtmListFilter.js';
import { handleMouseClickForDropdown, isLangRTL, onClickApplyFilter, setPageNumberAndPageSize, onResetFilter, bgOfStatus, getStatusCode, onPressEnterKey, formatDate, } from '../../../utils/AppUtils';
import ApproveRejectPopup from '../../common/ApproveRejectPopup.js';

function AdminFtmList () {
    const navigate = useNavigate('');
    const { t } = useTranslation();
    const isLoginLanguageRTL = isLangRTL(getUserProfile().langCode);
    const [errorCode, setErrorCode] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [dataLoaded, setDataLoaded] = useState(true);
    const [ftmList, setFtmList] = useState([]);
    const [expandFilter, setExpandFilter] = useState(false);
    const [order, setOrder] = useState("DESC");
    const [activeAscIcon, setActiveAscIcon] = useState("");
    const [activeDescIcon, setActiveDescIcon] = useState("createdDateTime");
    const [actionId, setActionId] = useState(-1);
    const [firstIndex, setFirstIndex] = useState(0);
    const [selectedRecordsPerPage, setSelectedRecordsPerPage] = useState(localStorage.getItem('itemsPerPage') ? Number(localStorage.getItem('itemsPerPage')) : 8);
    const [sortFieldName, setSortFieldName] = useState("createdDateTime");
    const [sortType, setSortType] = useState("desc");
    const [pageNo, setPageNo] = useState(0);
    const [pageSize, setPageSize] = useState(localStorage.getItem('itemsPerPage') ? Number(localStorage.getItem('itemsPerPage')) : 8);
    const [fetchData, setFetchData] = useState(false);
    const [tableDataLoaded, setTableDataLoaded] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [resetPageNo, setResetPageNo] = useState(false);
    const [applyFilter, setApplyFilter] = useState(false);
    const [showFtmApproveRejectPopup, setShowFtmApproveRejectPopup] = useState(false);
    const [filterAttributes, setFilterAttributes] = useState({
        partnerId: null,
        orgName: null,
        make: null,
        model: null,
        certificateExpiryStatus: null,
        status: null,
    });
    const submenuRef = useRef([]);

    useEffect(() => {
        handleMouseClickForDropdown(submenuRef, () => setActionId(-1));
    }, [submenuRef]);

    const tableHeaders = [
        { id: "partnerId", headerNameKey: 'ftmList.partnerId' },
        { id: "orgName", headerNameKey: 'ftmList.orgName' },
        { id: "make", headerNameKey: "ftmList.make" },
        { id: "model", headerNameKey: "ftmList.model" },
        { id: "createdDateTime", headerNameKey: "ftmList.createdDate" },
        { id: "certificateUploadDateTime", headerNameKey: "ftmList.certificateUploadDate" },
        { id: "certificateExpiryDateTime", headerNameKey: "ftmList.certificateExpiryDate" },
        { id: "certificateExpiryStatus", headerNameKey: "ftmList.certExpiryStatus" },
        { id: "status", headerNameKey: "ftmList.status" },
        { id: "action", headerNameKey: 'ftmList.action' }
    ];

    useEffect(() => {
        const list = [	
            {"ftmId":"10000","partnerId":"A10001","orgName":"ABC","make":"make1","model":"model1","status":"approved","isCertificateAvailable":true,"certificateUploadDateTime":"2024-09-17T10:25:46.000+00:00","certificateExpiryDateTime":"2025-09-17T10:25:46.000+00:00","isCertificateExpired":false,"createdDateTime":"2024-09-17T10:25:37.009826"},
            {"ftmId":"20000","partnerId":"A10002","orgName":"BCD","make":"make2","model":"model2","status":"rejected","isCertificateAvailable":true,"certificateUploadDateTime":"2024-09-18T10:25:46.000+00:00","certificateExpiryDateTime":"2025-09-18T10:25:46.000+00:00","isCertificateExpired":false,"createdDateTime":"2024-09-18T10:25:37.009826"},
            {"ftmId":"30000","partnerId":"A10003","orgName":"CDE","make":"make3","model":"model3","status":"pending_approval","isCertificateAvailable":true,"certificateUploadDateTime":"2024-09-19T10:25:46.000+00:00","certificateExpiryDateTime":"2025-09-19T10:25:46.000+00:00","isCertificateExpired":false,"createdDateTime":"2024-09-19T10:25:37.009826"},
            {"ftmId":"40000","partnerId":"A10004","orgName":"DEF","make":"make4","model":"model4","status":"pending_cert_upload","isCertificateAvailable":false,"certificateUploadDateTime":null,"certificateExpiryDateTime":null,"isCertificateExpired":false,"createdDateTime":"2024-09-17T10:25:37.009826"},
            {"ftmId":"50000","partnerId":"A10005","orgName":"EFG","make":"make5","model":"model5","status":"deactivated","isCertificateAvailable":true,"certificateUploadDateTime":"2024-09-20T10:25:46.000+00:00","certificateExpiryDateTime":"2025-09-20T10:25:46.000+00:00","isCertificateExpired":false,"createdDateTime":"2024-09-20T10:25:37.009826"},
            {"ftmId":"60000","partnerId":"A10006","orgName":"FGH","make":"make6","model":"model6","status":"approved","isCertificateAvailable":true,"certificateUploadDateTime":"2023-10-21T10:25:46.000+00:00","certificateExpiryDateTime":"2024-10-21T10:25:46.000+00:00","isCertificateExpired":true,"createdDateTime":"2024-09-21T10:25:37.009826"},
            {"ftmId":"70000","partnerId":"A10007","orgName":"GHI","make":"make7","model":"model7","status":"rejected","isCertificateAvailable":true,"certificateUploadDateTime":"2024-09-17T10:25:46.000+00:00","certificateExpiryDateTime":"2025-09-17T10:25:46.000+00:00","isCertificateExpired":false,"createdDateTime":"2024-09-17T10:25:37.009826"},
            {"ftmId":"80000","partnerId":"A10008","orgName":"ABC","make":"make8","model":"model8","status":"pending_approval","isCertificateAvailable":true,"certificateUploadDateTime":"2023-09-22T10:25:46.000+00:00","certificateExpiryDateTime":"2024-09-22T10:25:46.000+00:00","isCertificateExpired":true,"createdDateTime":"2024-09-22T10:25:37.009826"},
            {"ftmId":"90000","partnerId":"A10009","orgName":"ABCDEF","make":"make9","model":"model9","status":"approved","isCertificateAvailable":true,"certificateUploadDateTime":"2024-09-23T10:25:46.000+00:00","certificateExpiryDateTime":"2025-09-23T10:25:46.000+00:00","isCertificateExpired":false,"createdDateTime":"2024-09-23T10:25:37.009826"},
            {"ftmId":"10001","partnerId":"A10010","orgName":"ABC","make":"make10","model":"model10","status":"deactivated","isCertificateAvailable":true,"certificateUploadDateTime":"2024-09-17T10:25:46.000+00:00","certificateExpiryDateTime":"2025-09-17T10:25:46.000+00:00","isCertificateExpired":false,"createdDateTime":"2024-09-17T10:25:37.009826"},
            {"ftmId":"10002","partnerId":"A10011","orgName":"XXX","make":"make11","model":"model11","status":"rejected","isCertificateAvailable":true,"certificateUploadDateTime":"2024-09-17T10:25:46.000+00:00","certificateExpiryDateTime":"2025-09-17T10:25:46.000+00:00","isCertificateExpired":false,"createdDateTime":"2024-09-17T10:25:37.009826"}
        ];
        setTotalRecords(list.length);
        setFtmList(list);
    }, []);

    const onApplyFilter = (filters) => {
        onClickApplyFilter(filters, setApplyFilter, setResetPageNo, setFetchData, setFilterAttributes);
    };

    const getPaginationValues = (recordsPerPage, pageIndex) => {
        setPageNumberAndPageSize(recordsPerPage, pageIndex, pageNo, setPageNo, pageSize, setPageSize, setFetchData);
    };

    const cancelErrorMsg = () => {
        setErrorMsg("");
    };

    const viewFtmChipDetails = (ftm) => {

    };

    const approveRejectFtmDetails = (ftm) => {
        if (ftm.status === 'pending_approval') {
            setShowFtmApproveRejectPopup(true);
            document.body.style.overflow = "hidden";
          }
    };

    const closeApproveRejectPopup = () => {
        setActionId(-1);
        setShowFtmApproveRejectPopup(false);
      };

    const deactivateFtmDetails = (ftm) => {
        
    };

    const sortAscOrder = (header) => {
        if (order !== 'ASC' || activeAscIcon !== header) {
            setFetchData(true);
            setSortFieldName(header);
            setSortType("asc");
            setOrder("ASC");
            setActiveDescIcon("");
            setActiveAscIcon(header);
        }
    };
    const sortDescOrder = (header) => {
        if (order !== 'DESC' || activeDescIcon !== header) {
            setFetchData(true);
            setSortFieldName(header);
            setSortType('desc');
            setOrder("DESC");
            setActiveDescIcon(header);
            setActiveAscIcon("");
        }
    };

    const styles = {
        loadingDiv: "!py-[20%]"
    };

    return (
        <div className={`mt-2 w-[100%] ${isLoginLanguageRTL ? "mr-28 ml-5" : "ml-28 mr-5"} font-inter overflow-x-scroll`}>
            {!dataLoaded && (
                <LoadingIcon></LoadingIcon>
            )}
            {dataLoaded && (
                <>
                    {errorMsg && (
                        <ErrorMessage errorCode={errorCode} errorMessage={errorMsg} clickOnCancel={cancelErrorMsg} />
                    )}
                    <div className="flex-col mt-7">
                        <div className="flex justify-between mb-5 max-470:flex-col">
                            <Title title='ftmList.listOfFtm' backLink='/partnermanagement' />
                        </div>
                        { !applyFilter && ftmList.length === 0 ? (
                            <div className="bg-[#FCFCFC] w-full mt-3 rounded-lg shadow-lg items-center">
                                <EmptyList tableHeaders={tableHeaders} />
                            </div>
                        ) : (
                            <div className={`bg-[#FCFCFC] w-full mt-1 rounded-t-xl shadow-lg pt-3 ${!tableDataLoaded && "py-6"}`}>
                                <FilterButtons
                                    titleId='list_of_ftm_chip' 
                                    listTitle='ftmList.listOfFtm'
                                    dataListLength={totalRecords}
                                    filter={expandFilter}
                                    onResetFilter={onResetFilter}
                                    setFilter={setExpandFilter}
                                />
                                <hr className="h-0.5 mt-3 bg-gray-200 border-0" />
                                { expandFilter && (
                                    <AdminFtmListFilter onApplyFilter={onApplyFilter} />
                                )}
                                { !tableDataLoaded && <LoadingIcon styleSet={styles}></LoadingIcon>}
                                { tableDataLoaded && applyFilter && ftmList.length === 0 ?
                                    <EmptyList tableHeaders={tableHeaders} />
                                    : (
                                        <>
                                            <div className="mx-[2%] overflow-x-scroll">
                                                <table className="table-fixed">
                                                    <thead>
                                                        <tr>
                                                            {tableHeaders.map((header, index) => {
                                                                return (
                                                                    <th key={index} className="py-4 text-sm font-semibold text-[#6F6E6E] w-[15%]">
                                                                        <div className={`mx-2 flex gap-x-0 items-center ${isLoginLanguageRTL ? "text-right" : "text-left"}`}>
                                                                            {t(header.headerNameKey)}
                                                                            {(header.id !== "action") && (
                                                                                <SortingIcon
                                                                                    headerId={header.id}
                                                                                    sortDescOrder={sortDescOrder}
                                                                                    sortAscOrder={sortAscOrder}
                                                                                    order={order}
                                                                                    activeSortDesc={activeDescIcon}
                                                                                    activeSortAsc={activeAscIcon}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </th>
                                                                );
                                                            })}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {ftmList.map((ftm, index) => {
                                                            return (
                                                            <tr id={'ftm_list_item' + (index + 1)} key={index} className={`border-t border-[#E5EBFA] text-[0.8rem] text-[#191919] font-semibold break-words ${(ftm.status === "deactivated") ? "text-[#969696]" : "text-[#191919] cursor-pointer"}`}>
                                                                <td onClick={() => ftm.status !== 'deactivated' && viewFtmChipDetails(ftm)} className="px-2 break-all">{ftm.partnerId}</td>
                                                                <td onClick={() => ftm.status !== 'deactivated' && viewFtmChipDetails(ftm)} className="px-2 break-all">{ftm.orgName}</td>
                                                                <td onClick={() => ftm.status !== 'deactivated' && viewFtmChipDetails(ftm)} className="px-2 break-all">{ftm.make}</td>
                                                                <td onClick={() => ftm.status !== 'deactivated' && viewFtmChipDetails(ftm)} className="px-2 break-all">{ftm.model}</td>
                                                                <td onClick={() => ftm.status !== 'deactivated' && viewFtmChipDetails(ftm)} className="px-2 break-all">{formatDate(ftm.createdDateTime, 'date', true)}</td>
                                                                <td onClick={() => ftm.status !== 'deactivated' && viewFtmChipDetails(ftm)} className="px-2 break-all">{formatDate(ftm.certificateUploadDateTime, 'dateTime', false)}</td>
                                                                <td onClick={() => ftm.status !== 'deactivated' && viewFtmChipDetails(ftm)} className={`px-2 ${(ftm.isCertificateExpired && ftm.status !== "deactivated") && 'text-crimson-red font-bold'}`}>{formatDate(ftm.certificateExpiryDateTime, 'dateTime', false)}</td>
                                                                <td onClick={() => ftm.status !== 'deactivated' && viewFtmChipDetails(ftm)} className={`px-2 break-all`}>{ftm.isCertificateExpired ? 'Expired' : '-'}</td>
                                                                <td onClick={() => ftm.status !== 'deactivated' && viewFtmChipDetails(ftm)} className="px-2 mx-2">
                                                                    <div className={`${bgOfStatus(ftm.status)} flex w-fit py-1.5 px-2 my-3 text-xs font-semibold rounded-md`}>
                                                                        {getStatusCode(ftm.status, t)}
                                                                    </div>
                                                                </td>
                                                                <td className="text-center break-all">
                                                                    <div ref={(el) => (submenuRef.current[index] = el)}>
                                                                        <p id={"ftm_list_action_menu" + (index + 1)} onClick={() => setActionId(index === actionId ? null : index)} className={`font-semibold mb-0.5 text-[#191919] cursor-pointer text-center`}
                                                                            tabIndex="0" onKeyPress={(e) => onPressEnterKey(e, () => setActionId(index === actionId ? null : index))}>
                                                                            ...
                                                                        </p>
                                                                        {actionId === index && (
                                                                            <div className={`absolute w-[7%] z-50 bg-white text-xs font-semibold rounded-lg shadow-md border min-w-fit ${isLoginLanguageRTL ? "left-10 text-right" : "right-11 text-left"}`}>
                                                                                <div onClick={() => approveRejectFtmDetails(ftm)} className={`flex justify-between hover:bg-gray-100 ${ftm.status === 'pending_approval' ? 'cursor-pointer' : 'cursor-default'} `} tabIndex="0" onKeyPress={(e) => onPressEnterKey(e, () => approveRejectFtmDetails(ftm))}>
                                                                                    <p id="ftm_list_approve_reject_option" className={`py-1.5 px-4 ${ftm.status === 'pending_approval' ? 'text-[#3E3E3E] cursor-pointer' : 'text-[#A5A5A5] cursor-default'} ${isLoginLanguageRTL ? "pl-10" : "pr-10"}`}>{t("approveRejectPopup.approveReject")}</p>
                                                                                    <img src={approveRejectIcon} alt="" className={`${isLoginLanguageRTL ? "pl-2" : "pr-2"}`}></img>
                                                                                    </div>
                                                                                    {showFtmApproveRejectPopup &&
                                                                                        <ApproveRejectPopup
                                                                                            popupData={{ ...ftm, isFtmRequest: true }}
                                                                                            closePopUp={closeApproveRejectPopup}
                                                                                            title={ftm.make}
                                                                                            subtitle={`# ${ftm.model}`}
                                                                                            header={t('ftmRequestApproveRejectPopup.header', { make: ftm.make, model: ftm.model })}
                                                                                            description={t('ftmRequestApproveRejectPopup.description')}
                                                                                        />
                                                                                    }
                                                                                <hr className="h-px bg-gray-100 border-0 mx-1" />
                                                                                <div className="flex justify-between hover:bg-gray-100" onClick={() => viewFtmChipDetails(ftm)} tabIndex="0" onKeyPress={(e) => onPressEnterKey(e, () => viewFtmChipDetails(ftm))}>
                                                                                    <p id="ftm_list_view_option" className={`py-1.5 px-4 cursor-pointer text-[#3E3E3E] ${isLoginLanguageRTL ? "pl-10" : "pr-10"}`}>{t("partnerList.view")}</p>
                                                                                    <img src={viewIcon} alt="" className={`${isLoginLanguageRTL ? "pl-2" : "pr-2"}`}></img>
                                                                                </div>
                                                                                <hr className="h-px bg-gray-100 border-0 mx-1" />
                                                                                <div onClick={() => deactivateFtmDetails(ftm)} className={`flex justify-between hover:bg-gray-100 ${ftm.status === 'approved' ? 'cursor-pointer' : 'cursor-default'}`}tabIndex="0" onKeyPress={(e) => onPressEnterKey(e, () => deactivateFtmDetails(ftm))}>
                                                                                    <p id="ftm_list_deactivate_option" className={`py-1.5 px-4 ${isLoginLanguageRTL ? "pl-10" : "pr-10"} ${ftm.status === 'approved' ? "text-[#3E3E3E]" : "text-[#A5A5A5]"}`}>{t("partnerList.deActivate")}</p>
                                                                                    <img src={deactivateIcon} alt="" className={`${isLoginLanguageRTL ? "pl-2" : "pr-2"}`}></img>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            )
                                                        })
                                                        }
                                                    </tbody>
                                                </table>
                                                <Pagination
                                                    dataListLength={totalRecords}
                                                    selectedRecordsPerPage={selectedRecordsPerPage}
                                                    setSelectedRecordsPerPage={setSelectedRecordsPerPage}
                                                    setFirstIndex={setFirstIndex}
                                                    isServerSideFilter={true}
                                                    getPaginationValues={getPaginationValues}
                                                />
                                            </div>
                                        </>
                                    )
                                }
                            </div>

                        )}
                    </div>
                </>
            )}
        </div>
    );

}
export default AdminFtmList;