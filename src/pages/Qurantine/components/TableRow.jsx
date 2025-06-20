import React from 'react';
import Swal from 'sweetalert2';
import { capitalize } from '../../../utils/formatters';
import { quarantineAction } from '../../../api/pmgService';

function TableRow({ id, sender, receiver, reason, time, size, onDelete }) {
  const handleAction = async (type) => {
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `You are about to ${type} this email.`,
      showCancelButton: true,
      confirmButtonText: `Yes, ${type} it!`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await quarantineAction(id, type);
      Swal.fire('Success', ` Mail ${type}d successfully.`, 'success');

      if (type === 'delete') {
        onDelete(id);
      }
    } catch (err) {
      Swal.fire('Failed', `❌ ${err.message}`, 'error');
    }
  };

  return (
    <tr>
      <td>{sender}</td>
      <td>{receiver}</td>
      <td>{capitalize(reason)}</td>
      <td>{time}</td>
      <td>{size}</td>
      <td>
        <button onClick={() => handleAction('deliver')} className="btn btn-sm btn-green">
          Deliver
        </button>{' '}
        <button onClick={() => handleAction('delete')} className="btn btn-sm btn-red">
          Delete
        </button>
      </td>
    </tr>
  );
}

export default TableRow;
